const express = require('express');
const cors = require('cors');
const useragent = require('useragent');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Poncholove20!!";

// --- IN-MEMORY DATABASE ---
let views = [];
const dbModule = {
    insertView: (ip, location, os, browser, device, pagePath, referrer) => {
        try {
            views.push({ ip, location, os, browser, device, path: pagePath, referrer, timestamp: new Date().toISOString() });
            if (views.length > 500) views.shift();
        } catch (e) { }
    },
    getAnalytics: (limit = 100) => [...views].reverse().slice(0, limit),
    getStats: () => {
        const uniqueIps = new Set(views.map(v => v.ip)).size;
        return { totalViews: views.length, uniqueIps, browsers: [], locations: [] };
    }
};

app.get('/health', (req, res) => res.status(200).send('HEALTHY'));

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.post('/api/collect', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const ua = useragent.parse(req.headers['user-agent']);
        const { path: p, referrer: r } = req.body;
        dbModule.insertView(ip, 'Online', ua.os.toString(), ua.toAgent(), ua.device.toString(), p, r);
        res.status(200).json({ status: 'ok' });
    } catch (e) { res.status(200).json({ status: 'error' }); }
});

app.get('/admin', (req, res) => {
    res.send('<h1>Admin Panel (Simplified)</h1><p>Analytics is active in-memory.</p>');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) res.status(200).send('<h1>ESCO.IO</h1><p>System is booting... Refresh in 30 seconds.</p>');
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
