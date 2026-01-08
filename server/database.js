const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use Railway volume if mounted, otherwise use local directory
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'analytics.db')
    : path.join(__dirname, 'analytics.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    console.log(`📁 Creating missing directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`📊 Analytics database path: ${dbPath}`);
const db = new Database(dbPath);

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

const insertView = db.prepare(`
    INSERT INTO page_views (ip, location, os, browser, device, path, referrer)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getAnalytics = (limit = 100) => {
    return db.prepare('SELECT * FROM page_views ORDER BY timestamp DESC LIMIT ?').all(limit);
};

const getStats = () => {
    const totalViews = db.prepare('SELECT COUNT(*) as count FROM page_views').get().count;
    const uniqueIps = db.prepare('SELECT COUNT(DISTINCT ip) as count FROM page_views').get().count;
    const browsers = db.prepare('SELECT browser, COUNT(*) as count FROM page_views GROUP BY browser ORDER BY count DESC').all();
    const locations = db.prepare('SELECT location, COUNT(*) as count FROM page_views GROUP BY location ORDER BY count DESC').all();

    return { totalViews, uniqueIps, browsers, locations };
};

module.exports = { insertView, getAnalytics, getStats };
