const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const UAParser = require('ua-parser-js');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASS = process.env.ADMIN_PASS || 'Poncholove20!!';

// --- IN-MEMORY DATABASE ---
// This replaces the PostgreSQL database. Data is lost on server restart.
const memoryDb = {
    logs: [], // Stores all page view events
    stats: {
        total_views: 0,
        unique_visitors: new Set(),
        countries: new Set()
    }
};

app.enable('trust proxy');
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

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

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const ua = UAParser(req.headers['user-agent']);
    const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();
    const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim();
    const device = ua.device.type || 'Desktop';

    let city = 'Unknown', country = 'Unknown', isp = 'Unknown', lat = null, lon = null;

    // IP Geolocation (only if valid IP)
    if (ip && ip.length > 6 && !ip.startsWith('127') && !ip.startsWith('::1')) {
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,isp,lat,lon`);
            const geo = await geoRes.json();
            if (geo.status === 'success') {
                city = geo.city;
                country = geo.country;
                isp = geo.isp;
                lat = geo.lat; // Keep as number
                lon = geo.lon; // Keep as number
            }
        } catch (e) { /* ignore */ }
    }

    const newLog = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        path,
        referrer,
        screen,
        ip,
        city,
        country,
        isp,
        browser,
        os,
        device,
        lat,
        lon,
        meta,
        timestamp: new Date().toISOString()
    };

    // Store in memory
    memoryDb.logs.unshift(newLog); // Add to beginning for easier recent retrieval

    // Update simple stats
    memoryDb.stats.total_views++;
    memoryDb.stats.unique_visitors.add(ip);
    if (country !== 'Unknown') memoryDb.stats.countries.add(country);

    // Limit memory usage (keep last 5000 logs)
    if (memoryDb.logs.length > 5000) {
        memoryDb.logs = memoryDb.logs.slice(0, 5000);
    }

    res.json({ ok: true });
});

// --- DASHBOARD DATA ---
app.get('/api/dashboard', requireAuth, (req, res) => {
    const { filter } = req.query;

    let filteredLogs = memoryDb.logs;

    // Filter logic
    if (filter) {
        const lowerFilter = filter.toLowerCase();
        filteredLogs = filteredLogs.filter(log =>
            (log.path && log.path.toLowerCase().includes(lowerFilter)) ||
            (log.city && log.city.toLowerCase().includes(lowerFilter)) ||
            (log.country && log.country.toLowerCase().includes(lowerFilter)) ||
            (log.ip && log.ip.includes(lowerFilter)) ||
            (log.browser && log.browser.toLowerCase().includes(lowerFilter)) ||
            (log.os && log.os.toLowerCase().includes(lowerFilter))
        );
    }

    // Aggregations
    const topCitiesMap = {};
    const topIspsMap = {};
    const browsersMap = {};
    const mapPointsMap = {}; // Key: "lat,lon"

    memoryDb.logs.forEach(log => {
        if (log.city !== 'Unknown') {
            const key = `${log.city}||${log.country}`;
            topCitiesMap[key] = (topCitiesMap[key] || 0) + 1;
        }
        if (log.isp !== 'Unknown') {
            topIspsMap[log.isp] = (topIspsMap[log.isp] || 0) + 1;
        }
        if (log.browser !== 'Unknown') {
            browsersMap[log.browser] = (browsersMap[log.browser] || 0) + 1;
        }
        if (log.lat && log.lon) {
            const key = `${log.lat},${log.lon}`;
            if (!mapPointsMap[key]) {
                mapPointsMap[key] = { lat: log.lat, lon: log.lon, city: log.city, country: log.country, count: 0 };
            }
            mapPointsMap[key].count++;
        }
    });

    const getTop5 = (map) => Object.entries(map)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([k, count]) => {
            if (k.includes('||')) {
                const [city, country] = k.split('||');
                return { city, country, count };
            }
            return { name: k, count }; // for simpler keys
        });

    const topCities = getTop5(topCitiesMap);

    // Fix format for ISP and Browser to match frontend expectation if it's generic
    // Frontend expects { isp: '...', count: ... } and { browser: '...', count: ... }
    const topIsps = Object.entries(topIspsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([isp, count]) => ({ isp, count }));

    const browsers = Object.entries(browsersMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([browser, count]) => ({ browser, count }));

    const mapPoints = Object.values(mapPointsMap);

    res.json({
        stats: {
            total_views: memoryDb.stats.total_views,
            unique_visitors: memoryDb.stats.unique_visitors.size,
            countries: memoryDb.stats.countries.size
        },
        top_cities: topCities,
        top_isps: topIsps,
        browsers: browsers,
        recent_logs: filteredLogs.slice(0, 100), // First 100
        map_points: mapPoints
    });
});

// --- DELETE LOGS ---
app.delete('/api/logs', requireAuth, (req, res) => {
    const { ids, all } = req.body;

    if (all) {
        memoryDb.logs = [];
        memoryDb.stats.total_views = 0;
        memoryDb.stats.unique_visitors = new Set();
        memoryDb.stats.countries = new Set();
        return res.json({ success: true, message: 'All logs cleared' });
    }

    if (ids && Array.isArray(ids)) {
        memoryDb.logs = memoryDb.logs.filter(log => !ids.includes(log.id));
        // Note: Not recalculating total_views/visitors exactly to avoid complexity, 
        // but ideally we should rebuild stats if we want perfection.
        // For now, let's leave stats monotonic or just rebuild them.

        // Rebuild stats for accuracy
        const newStats = {
            total_views: memoryDb.logs.length,
            unique_visitors: new Set(),
            countries: new Set()
        };
        memoryDb.logs.forEach(log => {
            newStats.unique_visitors.add(log.ip);
            if (log.country !== 'Unknown') newStats.countries.add(log.country);
        });
        memoryDb.stats = newStats;

        return res.json({ success: true, message: `Deleted ${ids.length} logs` });
    }

    return res.status(400).json({ error: 'Invalid request' });
});

// --- PUBLIC STATS ---
app.get('/api/stats', (req, res) => {
    res.json({ visits: memoryDb.stats.total_views });
});

// --- STATIC FILES & FALLBACK ---
const distPath = path.join(process.cwd(), 'dist');
// Create dist/index.html if missing for dev safety
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
