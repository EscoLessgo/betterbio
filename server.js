const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const UAParser = require('ua-parser-js');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Database Setup (Postgres on Railway)
let pool = null;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    // Init Table & Schema Migration
    const initDb = async () => {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS page_views (
                    id SERIAL PRIMARY KEY,
                    path TEXT,
                    referrer TEXT,
                    screen TEXT,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    meta JSONB
                )
            `);

            // Add new columns if they don't exist (Manual Migration)
            const columns = ['ip', 'city', 'country', 'isp', 'browser', 'os', 'device'];
            for (const col of columns) {
                await pool.query(`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS ${col} TEXT`);
            }
            console.log('✅ Analytics DB Schema Verified');
        } catch (e) {
            console.error('DB Init Error:', e.message);
        }
    };
    initDb();
} else {
    console.warn('⚠️ No DATABASE_URL found. Analytics will be in-memory only.');
}

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Health
app.get('/health', (req, res) => res.send('OK'));

// 4. Enhanced Analytics Endpoint
app.post('/api/collect', async (req, res) => {
    const { path, referrer, screen, meta } = req.body || {};

    // 1. Get IP
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    // 2. Parse User Agent
    const ua = UAParser(req.headers['user-agent']);
    const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();
    const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim();
    const device = ua.device.type || 'Desktop';

    // 3. Geo Lookup (Server-side)
    let city = 'Unknown', country = 'Unknown', isp = 'Unknown';
    if (ip && ip.length > 6 && !ip.startsWith('127') && !ip.startsWith('::1')) {
        try {
            // Using ip-api.com (Free tier: 45 req/min, non-commercial)
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,isp`);
            const geo = await geoRes.json();
            if (geo.status === 'success') {
                city = geo.city;
                country = geo.country;
                isp = geo.isp;
            }
        } catch (e) { /* ignore geo fail */ }
    }

    if (pool) {
        try {
            await pool.query(
                `INSERT INTO page_views 
                (path, referrer, screen, ip, city, country, isp, browser, os, device, meta) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [path, referrer, screen, ip, city, country, isp, browser, os, device, meta ? JSON.stringify(meta) : null]
            );
            return res.json({ ok: true });
        } catch (e) {
            console.error('Analytics Insert Error:', e.message);
        }
    }

    res.json({ ok: true, saved: false });
});

app.get('/api/dashboard', async (req, res) => {
    if (!pool) return res.json({ error: 'No DB configured', mock: true });

    try {
        const [stats, topCities, topIsps, browsers, recent] = await Promise.all([
            pool.query(`
                SELECT 
                    COUNT(*) as total, 
                    COUNT(DISTINCT ip) as visitors,
                    COUNT(DISTINCT country) as countries
                FROM page_views
            `),
            pool.query('SELECT city, country, COUNT(*) as count FROM page_views WHERE city IS NOT NULL AND city != \'Unknown\' GROUP BY city, country ORDER BY count DESC LIMIT 5'),
            pool.query('SELECT isp, COUNT(*) as count FROM page_views WHERE isp IS NOT NULL AND isp != \'Unknown\' GROUP BY isp ORDER BY count DESC LIMIT 5'),
            pool.query('SELECT browser, COUNT(*) as count FROM page_views WHERE browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 5'),
            pool.query('SELECT * FROM page_views ORDER BY timestamp DESC LIMIT 20')
        ]);

        res.json({
            stats: {
                total_views: parseInt(stats.rows[0].total),
                unique_visitors: parseInt(stats.rows[0].visitors),
                countries: parseInt(stats.rows[0].countries)
            },
            top_cities: topCities.rows,
            top_isps: topIsps.rows,
            browsers: browsers.rows,
            recent_logs: recent.rows
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

if (!fs.existsSync(distPath)) {
    try { fs.mkdirSync(distPath, { recursive: true }); } catch (e) { }
}
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
    try {
        fs.writeFileSync(indexPath, `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="5"></head><body><h1>DEPLOYING...</h1></body></html>`);
    } catch (e) { }
}

app.use(express.static(distPath));

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
