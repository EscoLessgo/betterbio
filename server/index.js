const express = require('express');
const path = require('path');
const cors = require('cors');

// FAILSAFE: Global Error Handlers to prevent 502 crashes
process.on('uncaughtException', (err) => {
    console.error('!!! UNCAUGHT EXCEPTION !!!', err);
    // Do not exit, keep running if possible
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('!!! UNHANDLED REJECTION !!!', reason);
});

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Poncholove20!!';

// Explicitly log startup configuration
console.log('--- SYSTEM STARTING ---');
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`CWD: ${process.cwd()}`);

const distPath = path.join(process.cwd(), 'dist');
console.log(`DIST_PATH: ${distPath}`);

// In-memory analytics
const analyticsData = {
    visits: [],
    startTime: new Date().toISOString()
};

app.use(cors());
app.use(express.json());

// 1. Health check (Highest Priority)
app.get('/health', (req, res) => {
    console.log('Health check received');
    res.status(200).send('OK');
});

// 2. Static Assets
app.use(express.static(distPath));

// 3. Simple Analytics (No external deps)
app.post('/api/collect', (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        analyticsData.visits.unshift({
            timestamp: new Date().toISOString(),
            ip: ip || 'unknown',
            path: req.body.path || '/',
            ua: req.headers['user-agent'] || 'unknown'
        });
        // Limit memory usage
        if (analyticsData.visits.length > 5000) analyticsData.visits.length = 5000;
        res.status(200).json({ status: 'ok' });
    } catch (e) {
        console.error('Analytics Error:', e);
        res.status(200).json({ status: 'ok' });
    }
});

app.get('/api/stats', (req, res) => {
    if (req.headers.authorization === ADMIN_PASSWORD) {
        res.json({
            summary: {
                totalVisits: analyticsData.visits.length,
                startTime: analyticsData.startTime,
                uniqueIPs: new Set(analyticsData.visits.map(v => v.ip)).size
            },
            visits: analyticsData.visits.slice(0, 100)
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// 4. Admin UI (Inline HTML)
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html><head><title>ADMIN</title>
        <style>body{background:#000;color:#0f0;font-family:monospace;padding:20px}input{background:#111;border:1px solid #0f0;color:#fff;padding:10px}</style>
        </head><body>
        <h1>SYSTEM_ADMIN</h1>
        <input id="p" type="password" placeholder="PASSWORD"><button onclick="go()">LOGIN</button>
        <div id="d" style="display:none"><pre id="json"></pre></div>
        <script>
        async function go(){
            const h = {Authorization:document.getElementById('p').value};
            const r = await fetch('/api/stats',{headers:h});
            if(r.ok){
                document.getElementById('d').style.display='block';
                document.getElementById('json').innerText=JSON.stringify(await r.json(),null,2);
            }
        }
        </script></body></html>
    `);
});

// 5. Catch-All for SPA
// 5. Catch-All for SPA (Middleware)
app.use((req, res, next) => {
    // If it's an API route and not handled, sending index can be confusing, but this is standard SPA fallback.
    // However, let's skip API routes to avoid confusion.
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n>>> SERVER LISTENING ON 0.0.0.0:${PORT} <<<\n`);
});
