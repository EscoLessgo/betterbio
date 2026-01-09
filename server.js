const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const UAParser = require('ua-parser-js');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASS = process.env.ADMIN_PASS || 'Poncholove20!!'; // Default from README

// 1. Database Setup
let pool = null;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    // Auto-Schema Migration
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
            const columns = ['ip', 'city', 'country', 'isp', 'browser', 'os', 'device', 'lat', 'lon'];
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
    console.warn('⚠️ No DATABASE_URL. Analytics disabled.');
}

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

// 2. Auth Middleware
const requireAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${ADMIN_PASS}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.post('/api/auth', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASS) return res.json({ token: ADMIN_PASS });
    return res.status(401).json({ error: 'Invalid Password' });
});

// 3. Collection Endpoint
app.post('/api/collect', async (req, res) => {
    const { path, referrer, screen, meta } = req.body || {};

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const ua = UAParser(req.headers['user-agent']);
    const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();
    const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim();
    const device = ua.device.type || 'Desktop';

    let city = 'Unknown', country = 'Unknown', isp = 'Unknown', lat = null, lon = null;
    if (ip && ip.length > 6 && !ip.startsWith('127') && !ip.startsWith('::1')) {
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,isp,lat,lon`);
            const geo = await geoRes.json();
            if (geo.status === 'success') {
                city = geo.city;
                country = geo.country;
                isp = geo.isp;
                lat = String(geo.lat);
                lon = String(geo.lon);
            }
        } catch (e) { /* ignore */ }
    }

    if (pool) {
        try {
            await pool.query(
                `INSERT INTO page_views 
                (path, referrer, screen, ip, city, country, isp, browser, os, device, lat, lon, meta) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [path, referrer, screen, ip, city, country, isp, browser, os, device, lat, lon, meta ? JSON.stringify(meta) : null]
            );
            return res.json({ ok: true });
        } catch (e) {
            console.error('Insert Error:', e.message);
        }
    }
    res.json({ ok: true, saved: false });
});

// 4. Dashboard Data with Filtering
app.get('/api/dashboard', requireAuth, async (req, res) => {
    if (!pool) return res.json({ error: 'DB Error', mock: true });

    try {
        // Fetch base stats
        const statsQuery = `SELECT COUNT(*) as total, COUNT(DISTINCT ip) as visitors, COUNT(DISTINCT country) as countries FROM page_views`;
        const topCitiesQuery = `SELECT city, country, COUNT(*) as count FROM page_views WHERE city != 'Unknown' GROUP BY city, country ORDER BY count DESC LIMIT 5`;
        const topIspsQuery = `SELECT isp, COUNT(*) as count FROM page_views WHERE isp != 'Unknown' GROUP BY isp ORDER BY count DESC LIMIT 5`;
        const browsersQuery = `SELECT browser, COUNT(*) as count FROM page_views WHERE browser != 'Unknown' GROUP BY browser ORDER BY count DESC LIMIT 5`;
        const mapQuery = `SELECT lat, lon, city, country, COUNT(*) as count FROM page_views WHERE lat IS NOT NULL GROUP BY lat, lon, city, country`;

        // Dynamic Filter for Logs
        let logQuery = `SELECT * FROM page_views`;
        let params = [];
        let whereClauses = [];

        const { filter } = req.query;
        // Simple search across fields if filter exists
        if (filter) {
            whereClauses.push(`(path ILIKE $1 OR city ILIKE $1 OR country ILIKE $1 OR ip ILIKE $1 OR browser ILIKE $1 OR os ILIKE $1)`);
            params.push(`%${filter}%`);
        }

        if (whereClauses.length > 0) {
            logQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        logQuery += ` ORDER BY timestamp DESC LIMIT 100`;

        const [stats, topCities, topIsps, browsers, recent, mapData] = await Promise.all([
            pool.query(statsQuery),
            pool.query(topCitiesQuery),
            pool.query(topIspsQuery),
            pool.query(browsersQuery),
            pool.query(logQuery, params),
            pool.query(mapQuery)
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
            recent_logs: recent.rows,
            map_points: mapData.rows
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 5. Delete Logs Endpoint
app.delete('/api/logs', requireAuth, async (req, res) => {
    const { ids, all } = req.body;

    if (!pool) return res.status(500).json({ error: 'No DB' });

    try {
        if (all) {
            await pool.query('DELETE FROM page_views');
            return res.json({ success: true, message: 'All logs cleared' });
        }

        if (ids && Array.isArray(ids) && ids.length > 0) {
            await pool.query('DELETE FROM page_views WHERE id = ANY($1)', [ids]);
            return res.json({ success: true, message: `Deleted ${ids.length} logs` });
        }

        return res.status(400).json({ error: 'Invalid request' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/stats', async (req, res) => {
    if (!pool) return res.json({ visits: 0 });
    try {
        const result = await pool.query('SELECT COUNT(*) as visits FROM page_views');
        res.json({ visits: parseInt(result.rows[0].visits) });
    } catch (e) { res.json({ visits: 0 }); }
});

const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) try { fs.mkdirSync(distPath, { recursive: true }); } catch (e) { }
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) try { fs.writeFileSync(indexPath, `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="5"></head><body><h1>DEPLOYING...</h1></body></html>`); } catch (e) { }

app.use(express.static(distPath));
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
    res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => console.log(`SERVER RUNNING ON ${PORT}`));
process.on('SIGTERM', () => { if (pool) pool.end(); process.exit(0); });
