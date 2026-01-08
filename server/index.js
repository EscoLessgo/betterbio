const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// 🛡️ SECURITY & STABILITY: Catch all process-level errors
process.on('uncaughtException', (err) => console.error('[FATAL] Uncaught:', err));
process.on('unhandledRejection', (reason) => console.error('[FATAL] Rejection:', reason));

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Poncholove20!!';

// Explicitly log startup configuration
console.log('--- SYSTEM STARTING ---');
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`CWD: ${process.cwd()}`);

// DEBUG: List files in CWD to verify build output
try {
    console.log('Directory listing of CWD:');
    console.log(fs.readdirSync(process.cwd()));
    const dist = path.join(process.cwd(), 'dist');
    if (fs.existsSync(dist)) {
        console.log('Directory listing of ./dist:');
        console.log(fs.readdirSync(dist));
    } else {
        console.error('!!! ./dist DIRECTORY DOES NOT EXIST !!!');
    }
} catch (e) {
    console.error('File listing failed:', e);
}

const distPath = path.join(process.cwd(), 'dist');

// 🧠 IN-MEMORY ANALYTICS
const analytics = { visits: [], boot: new Date().toISOString() };

app.use(cors());
app.use(express.json());

// 🩺 HEALTH CHECK
app.get('/health', (req, res) => res.send('OK'));

// 📂 STATIC ASSETS
app.use(express.static(distPath));

// 📊 ANALYTICS
app.post('/api/collect', (req, res) => {
    try {
        analytics.visits.unshift({
            t: new Date().toISOString(),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            path: req.body.path || 'unknown'
        });
        if (analytics.visits.length > 1000) analytics.visits.pop();
    } catch (e) { }
    res.json({ ok: true });
});

app.get('/api/stats', (req, res) => {
    if (req.headers.authorization !== ADMIN_PASSWORD) return res.status(401).json({ err: '401' });
    res.json(analytics);
});

// 👑 ADMIN
app.get('/admin', (req, res) => {
    res.send(`<!DOCTYPE html><html><body style="background:#111;color:#0f0;font-family:monospace">
    <h1>ADMIN_CORE</h1><input id="p" type="password"><button onclick="f()">LOGIN</button><pre id="d"></pre>
    <script>async function f(){const r=await fetch('/api/stats',{headers:{Authorization:document.getElementById('p').value}});if(r.ok)document.getElementById('d').innerText=JSON.stringify(await r.json(),null,2)}</script>
    </body></html>`);
});

// 🚀 SPA FALLBACK (Zero-Crash Guarantee)
app.use((req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).send('404');
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err && !res.headersSent) res.status(500).send('SERVER ERR: ' + err.message);
    });
});

app.listen(PORT, '0.0.0.0', () => console.log(`> Ready on 0.0.0.0:${PORT}`));
