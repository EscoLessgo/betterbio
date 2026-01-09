const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Database Setup (Postgres on Railway)
// graceful fallback if DATABASE_URL is missing (dev mode without local DB)
let pool = null;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Railway/Heroku
    });

    // Init Table
    pool.query(`
        CREATE TABLE IF NOT EXISTS page_views (
            id SERIAL PRIMARY KEY,
            path TEXT,
            referrer TEXT,
            screen TEXT,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            meta JSONB
        )
    `).catch(err => console.error('DB Init Error:', err.message));
} else {
    console.warn('⚠️ No DATABASE_URL found. Analytics will be in-memory only.');
}

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Health Check
app.get('/health', (req, res) => res.send('OK'));

// 4. Analytics Endpoint
app.post('/api/collect', async (req, res) => {
    const { path, referrer, screen, meta } = req.body || {};

    if (pool) {
        try {
            await pool.query(
                'INSERT INTO page_views (path, referrer, screen, meta) VALUES ($1, $2, $3, $4)',
                [path, referrer, screen, meta ? JSON.stringify(meta) : null]
            );
            return res.json({ ok: true });
        } catch (e) {
            console.error('Analytics Insert Error:', e.message);
            // Don't fail the request, just log
        }
    }

    console.log('Event (Local):', path);
    res.json({ ok: true, saved: false });
});

app.get('/api/dashboard', async (req, res) => {
    if (!pool) return res.json({ error: 'No DB configured', mock: true });

    try {
        const [totalRef, distinctRef, pagesRef, devicesRef, recentRef] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM page_views'),
            pool.query('SELECT COUNT(DISTINCT screen) as visitors FROM page_views'),
            pool.query('SELECT path, COUNT(*) as count FROM page_views GROUP BY path ORDER BY count DESC LIMIT 5'),
            pool.query('SELECT screen, COUNT(*) as count FROM page_views GROUP BY screen ORDER BY count DESC LIMIT 5'),
            pool.query('SELECT * FROM page_views ORDER BY timestamp DESC LIMIT 20')
        ]);

        res.json({
            stats: {
                total_views: parseInt(totalRef.rows[0].count),
                unique_devices: parseInt(distinctRef.rows[0].visitors)
            },
            top_pages: pagesRef.rows,
            top_devices: devicesRef.rows,
            recent_logs: recentRef.rows
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/stats', async (req, res) => {
    if (!pool) return res.json({ error: 'No DB configured', visits: 0 });
    try {
        const result = await pool.query('SELECT COUNT(*) as visits FROM page_views');
        res.json({ visits: parseInt(result.rows[0].visits) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 5. Static Assets & SPA Serving
const distPath = path.join(process.cwd(), 'dist');

// Fallback: Create temp index.html if dist is missing (prevents crash loops on fresh deploys)
if (!fs.existsSync(distPath)) {
    try { fs.mkdirSync(distPath, { recursive: true }); } catch (e) { }
}
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
    try {
        fs.writeFileSync(indexPath, `
            <!DOCTYPE html>
            <html style="background:#000;color:#0f0;font-family:monospace;display:flex;justify-content:center;align-items:center;height:100vh">
                <head><meta http-equiv="refresh" content="5"></head>
                <body><h1>DEPLOYING...<br>PLEASE_WAIT</h1></body>
            </html>
        `);
    } catch (e) { }
}

app.use(express.static(distPath));

// CTA: Catch-all for SPA
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
    res.sendFile(indexPath);
});

// 6. Start
app.listen(PORT, '0.0.0.0', () => console.log(`SERVER RUNNING ON ${PORT}`));

// 7. Cleanup
process.on('SIGTERM', () => {
    if (pool) pool.end();
    process.exit(0);
});
