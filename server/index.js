const express = require('express');
const cors = require('cors');
const useragent = require('useragent');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Poncholove20!!";

// 1. GREETING & HEALTH (Must be first to bypass potential crashes)
app.get('/health', (req, res) => res.status(200).send('SYSTEM_OPERATIONAL'));

app.use(cors());
app.use(express.json());

// Serving static files from the build directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Lazy-load database to prevent startup crashes
let dbModule;
try {
    dbModule = require('./database');
    console.log('✅ Database module linked');
} catch (e) {
    console.error('⚠️ Database link failed, using safety bypass');
    dbModule = {
        insertView: () => { },
        getAnalytics: () => [],
        getStats: () => ({ totalViews: 0, uniqueIps: 0, browsers: [], locations: [] })
    };
}

// Middle-ware to parse location from IP
async function getLocation(ip) {
    if (ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1')) return 'Localhost';
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        return data.status === 'success' ? `${data.city}, ${data.country}` : 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

// Tracking Endpoint
app.post('/api/collect', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const ua = useragent.parse(req.headers['user-agent']);
        const { path: pagePath, referrer } = req.body;

        const location = await getLocation(ip);
        const os = ua.os.toString();
        const browser = ua.toAgent();
        const device = ua.device.toString();

        dbModule.insertView(ip, location, os, browser, device, pagePath, referrer);
        res.status(200).json({ status: 'tracked' });
    } catch (err) {
        console.error('Tracking Error:', err);
        res.status(200).json({ status: 'failed_silently' }); // Never crash the request
    }
});

// Admin Dashboard DATA
app.get('/api/admin/stats', (req, res) => {
    const password = req.query.pass;
    if (password !== ADMIN_PASSWORD) return res.status(401).send('Unauthorized');

    const stats = dbModule.getStats();
    const recent = dbModule.getAnalytics(200);
    res.json({ stats, recent });
});

// Simple Admin Portal HTML
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html')); // We'll move the HTML to its own file for stability
});

// SPA Catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NEURAL_LINK_ESTABLISHED on port ${PORT}`);
});
