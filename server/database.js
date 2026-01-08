const path = require('path');
const fs = require('fs');

let Database;
let isMock = false;

try {
    Database = require('better-sqlite3');
    console.log('✅ SQLite library loaded successfully');
} catch (e) {
    console.error('⚠️ Could not load better-sqlite3. Using MOCK database to prevent crash.');
    isMock = true;
}

// Initial paths
let dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'analytics.db')
    : path.join(__dirname, 'analytics.db');

let db;

if (!isMock) {
    // Ensure directory exists with fallback
    const dbDir = path.dirname(dbPath);
    try {
        if (!fs.existsSync(dbDir)) {
            console.log(`📁 Attempting to create directory: ${dbDir}`);
            fs.mkdirSync(dbDir, { recursive: true });
        }
    } catch (error) {
        console.error(`❌ Permission denied for ${dbDir}. Falling back to project root.`);
        dbPath = path.join(__dirname, 'analytics.db');
    }

    try {
        db = new Database(dbPath);
        // Initialize analytics table
        db.exec(`
            CREATE TABLE IF NOT EXISTS page_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT,
                location TEXT,
                os TEXT,
                browser TEXT,
                device TEXT,
                path TEXT,
                referrer TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log(`📊 Analytics database initialized at: ${dbPath}`);
    } catch (error) {
        console.error(`❌ Could not open database at ${dbPath}, switching to MOCK mode.`);
        isMock = true;
    }
}

// Exportable functions (Real or Mock)
const insertView = (ip, location, os, browser, device, pagePath, referrer) => {
    if (isMock) return;
    try {
        const stmt = db.prepare(`
            INSERT INTO page_views (ip, location, os, browser, device, path, referrer)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(ip, location, os, browser, device, pagePath, referrer);
    } catch (e) {
        console.error('❌ Failed to insert view:', e);
    }
};

const getAnalytics = (limit = 100) => {
    if (isMock) return [];
    return db.prepare('SELECT * FROM page_views ORDER BY timestamp DESC LIMIT ?').all(limit);
};

const getStats = () => {
    if (isMock) return { totalViews: 0, uniqueIps: 0, browsers: [], locations: [] };
    const totalViews = db.prepare('SELECT COUNT(*) as count FROM page_views').get().count;
    const uniqueIps = db.prepare('SELECT COUNT(DISTINCT ip) as count FROM page_views').get().count;
    const browsers = db.prepare('SELECT browser, COUNT(*) as count FROM page_views GROUP BY browser ORDER BY count DESC').all();
    const locations = db.prepare('SELECT location, COUNT(*) as count FROM page_views GROUP BY location ORDER BY count DESC').all();

    return { totalViews, uniqueIps, browsers, locations };
};

module.exports = { insertView, getAnalytics, getStats };
