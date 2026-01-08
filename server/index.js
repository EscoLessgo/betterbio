const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.join(process.cwd(), 'dist');

// 🛠️ SYSTEM STABILIZATION: Ensure a fallback exists
// If valid dist/index.html is missing, we create a temporary one in memory/fs logic
// to prevent the server from crashing or serving 500s.
if (!fs.existsSync(distPath)) {
    console.log('!!! Creating fallback dist directory !!!');
    try { fs.mkdirSync(distPath, { recursive: true }); } catch (e) { }
}
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.log('!!! Creating fallback index.html !!!');
    try {
        fs.writeFileSync(indexPath, '<!DOCTYPE html><html><body style="background:#000;color:#0f0;font-family:monospace;display:flex;justify-content:center;align-items:center;height:100vh"><h1>SYSTEM_INITIALIZING...<br>PLEASE_REFRESH</h1></body></html>');
    } catch (e) { }
}

app.use(cors());
app.use(express.json());

// 🩺 HEALTH CHECK
app.get('/health', (req, res) => res.send('OK'));

// 📂 STATIC ASSETS
app.use(express.static(distPath));

// 📊 SIMPLE ANALYTICS (Crash-proof)
app.post('/api/collect', (req, res) => res.json({ ok: true }));
app.get('/api/stats', (req, res) => res.json({ status: 'active' }));

// 🚀 SPA FALLBACK
app.use((req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: '404' });
    res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SERVER_ONLINE_PORT_${PORT}`);
});

// Graceful Shutdown
const shutdown = () => {
    console.log('Shutting down...');
    process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
