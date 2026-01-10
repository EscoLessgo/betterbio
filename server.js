const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const UAParser = require('ua-parser-js');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASS = process.env.ADMIN_PASS || 'Poncholove20!!';

// --- DATABASE SETUP (PostgreSQL) ---
let pool = null;
let dbConnected = false;

if (process.env.DATABASE_URL) {
    console.log('🔌 Found DATABASE_URL, attempting connection...');
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Required for Railway/Heroku
        connectionTimeoutMillis: 5000 // Fail fast if unreachable
    });

    pool.on('error', (err) => {
        console.error('❌ Unexpected DB Error:', err);
        dbConnected = false;
    });

    // Initial Connection Test & Schema Migration
    (async () => {
        try {
            const client = await pool.connect();
            console.log('✅ Connected to PostgreSQL');
            dbConnected = true;

            // Schema Migration
            await client.query(`
                CREATE TABLE IF NOT EXISTS page_views (
                    id SERIAL PRIMARY KEY,
                    path TEXT,
                    referrer TEXT,
                    screen TEXT,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    ip TEXT,
                    city TEXT,
                    country TEXT,
                    isp TEXT,
                    browser TEXT,
                    os TEXT,
                    device TEXT,
                    lat TEXT,
                    lon TEXT,
                    meta JSONB
                );
            `);
            // Ensure columns exist (for older schemas)
            const columns = ['ip', 'city', 'country', 'isp', 'browser', 'os', 'device', 'lat', 'lon'];
            for (const col of columns) {
                await client.query(`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS ${col} TEXT`);
            }

            console.log('✅ DB Schema Verified');
            client.release();
        } catch (err) {
            console.error('❌ Failed to connect to DB:', err.message);
            dbConnected = false;
        }
    })();
} else {
    console.warn('⚠️ No DATABASE_URL found. Analytics will drop to limited mode (or fail).');
}

app.enable('trust proxy');
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', db: dbConnected });
});

// --- AUTH MIDDLEWARE ---
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

// --- COLLECTION ENDPOINT ---
app.post('/api/signal', async (req, res) => {
    const { path, referrer, screen, meta } = req.body || {};

    // Get IP
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    // Parse User Agent
    const ua = UAParser(req.headers['user-agent']);
    const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();
    const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim();
    const device = ua.device.type || 'Desktop';

    let city = 'Unknown', country = 'Unknown', isp = 'Unknown', lat = null, lon = null;

    // IP Geolocation
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
        } catch (e) { /* ignore geo fail */ }
    }

    if (pool && dbConnected) {
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
            return res.status(500).json({ error: 'DB Insert Failed' });
        }
    } else {
        console.warn('Signal received but DB not connected.');
        return res.json({ ok: true, saved: false, warn: 'No DB' });
    }
});

// --- DASHBOARD DATA ---
app.get('/api/dashboard', requireAuth, async (req, res) => {
    if (!pool || !dbConnected) return res.status(503).json({ error: 'DB_DISCONNECTED' });

    try {
        const { filter } = req.query;

        // Base Stats
        const statsQuery = `SELECT COUNT(*) as total, COUNT(DISTINCT ip) as visitors, COUNT(DISTINCT country) as countries FROM page_views`;

        // Maps/Lists
        const topCitiesQuery = `SELECT city, country, COUNT(*) as count FROM page_views WHERE city != 'Unknown' GROUP BY city, country ORDER BY count DESC LIMIT 5`;
        const topIspsQuery = `SELECT isp, COUNT(*) as count FROM page_views WHERE isp != 'Unknown' GROUP BY isp ORDER BY count DESC LIMIT 5`;
        const browsersQuery = `SELECT browser, COUNT(*) as count FROM page_views WHERE browser != 'Unknown' GROUP BY browser ORDER BY count DESC LIMIT 5`;
        const mapQuery = `SELECT lat, lon, city, country, COUNT(*) as count FROM page_views WHERE lat IS NOT NULL GROUP BY lat, lon, city, country`;

        // Filtered Logs
        let logQuery = `SELECT * FROM page_views`;
        let params = [];
        if (filter) {
            logQuery += ` WHERE (path ILIKE $1 OR city ILIKE $1 OR country ILIKE $1 OR ip ILIKE $1)`;
            params.push(`%${filter}%`);
        }
        logQuery += ` ORDER BY id DESC LIMIT 100`;

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
                total_views: parseInt(stats.rows[0]?.total || 0),
                unique_visitors: parseInt(stats.rows[0]?.visitors || 0),
                countries: parseInt(stats.rows[0]?.countries || 0)
            },
            top_cities: topCities.rows,
            top_isps: topIsps.rows,
            browsers: browsers.rows,
            recent_logs: recent.rows,
            map_points: mapData.rows
        });

    } catch (e) {
        console.error('Dashboard Error:', e);
        res.status(500).json({ error: 'Query Failed: ' + e.message });
    }
});

// --- DELETE LOGS ---
app.delete('/api/logs', requireAuth, async (req, res) => {
    const { ids, all } = req.body;
    if (!pool || !dbConnected) return res.status(503).json({ error: 'DB_DISCONNECTED' });

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

// --- PUBLIC STATS ---
app.get('/api/stats', async (req, res) => {
    if (!pool || !dbConnected) return res.json({ visits: 0 });
    try {
        const result = await pool.query('SELECT COUNT(*) as visits FROM page_views');
        res.json({ visits: parseInt(result.rows[0]?.visits || 0) });
    } catch (e) { res.json({ visits: 0 }); }
});

// --- STATIC FILES & FALLBACK ---
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) try { fs.mkdirSync(distPath, { recursive: true }); } catch (e) { }
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) try { fs.writeFileSync(indexPath, `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="5"></head><body><h1>DEPLOYING...</h1></body></html>`); } catch (e) { }

app.use(express.static(distPath));

// Handle client-side routing
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
    res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => console.log(`SERVER RUNNING ON ${PORT}`));
