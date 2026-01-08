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

console.log('--- booting esco.io system ---');
console.log(`> cwd: ${process.cwd()}`);
console.log(`> port: ${PORT}`);

// 📄 PRE-LOAD INDEX.HTML (CRITICAL FIX)
// Instead of reading it on every request (which can crash), we read it ONCE at startup.
// If it fails, we serve a backup "Maintenance" page.
const distPath = path.join(process.cwd(), 'dist');
let INDEX_HTML = '';
const BACKUP_HTML = `<!DOCTYPE html><html><body style="background:#000;color:#0ff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:monospace"><h1>SYSTEM_REBOOTING...</h1></body></html>`;

try {
    const p = path.join(distPath, 'index.html');
    if (fs.existsSync(p)) {
        INDEX_HTML = fs.readFileSync(p, 'utf8');
        console.log('> index.html loaded successfully');
    } else {
        console.error('> index.html NOT FOUND at: ' + p);
        INDEX_HTML = BACKUP_HTML;
    }
} catch (e) {
    console.error('> Failed to load index.html:', e);
    INDEX_HTML = BACKUP_HTML;
}

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
    res.send(INDEX_HTML);
});

app.listen(PORT, '0.0.0.0', () => console.log(`> Ready on 0.0.0.0:${PORT}`));
