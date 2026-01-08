const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Poncholove20!!';

// In-memory analytics
const analyticsData = {
    visits: [],
    startTime: new Date().toISOString()
};

const distPath = path.join(process.cwd(), 'dist');
console.log(`[SYSTEM] Serving from: ${distPath}`);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

// API stats
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

// Analytics collection
app.post('/api/collect', (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        analyticsData.visits.unshift({
            timestamp: new Date().toISOString(),
            ip,
            path: req.body.path || '/',
            os: 'generic'
        });
        if (analyticsData.visits.length > 2000) analyticsData.visits.pop();
        res.status(200).json({ status: 'ok' });
    } catch (e) {
        res.status(200).json({ status: 'ok' });
    }
});

// Static assets
app.use(express.static(distPath));

// Admin UI
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>ESCO.IO | ANALYTICS_CORE</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
            <style>
                :root { --pcb-blue: #00ffff; --pcb-pink: #ff0077; --bg: #050505; }
                body { background: var(--bg); color: var(--pcb-blue); font-family: 'Roboto Mono', monospace; margin: 0; padding: 2rem; }
                .container { max-width: 1000px; margin: 0 auto; }
                .glitch { color: var(--pcb-pink); text-shadow: 2px 2px var(--pcb-blue); font-weight: bold; font-size: 1.8rem; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 1rem; }
                .card { background: #0a0a0f; border: 1px solid #00ffff33; padding: 1.5rem; margin-bottom: 2rem; border-radius: 4px; box-shadow: 0 0 20px rgba(0,255,255,0.05); }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
                .stat-box { border: 1px solid #ff007733; padding: 1rem; background: #0f0a0a; text-align: center; }
                .stat-val { font-size: 2rem; color: #fff; text-shadow: 0 0 10px var(--pcb-pink); }
                input { background: #000; border: 1px solid var(--pcb-pink); color: #fff; padding: 1rem; width: 300px; font-family: inherit; outline: none; }
                button { background: var(--pcb-pink); color: #fff; border: none; padding: 1rem 2rem; cursor: pointer; font-family: inherit; font-weight: bold; transition: 0.3s; margin-left: 10px; }
                button:hover { background: #fff; color: #000; box-shadow: 0 0 20px var(--pcb-pink); }
                table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-top: 1rem; }
                th { text-align: left; padding: 1rem; color: var(--pcb-pink); border-bottom: 2px solid #333; }
                td { padding: 0.8rem 1rem; border-bottom: 1px solid #1a1a1a; color: #aaa; }
                tr:hover td { color: #fff; background: #ffffff05; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="glitch">NEURAL_LINK_ADMIN_v1.8</h1>
                <div id="auth">
                    <input type="password" id="pw" placeholder="ENTER_PASSKEY">
                    <button onclick="go()">ESTABLISH_LINK</button>
                </div>
                <div id="dash" style="display:none">
                    <div class="stats-grid">
                        <div class="stat-box"><div>TOTAL_HITS</div><div class="stat-val" id="v">0</div></div>
                        <div class="stat-box"><div>UNIQUE_IPS</div><div class="stat-val" id="i">0</div></div>
                    </div>
                    <div class="card">
                        <h3>ACTIVITY_LOG</h3>
                        <table id="t">
                            <thead><tr><th>TIME</th><th>IP_ADDRESS</th><th>PATH_SHARD</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
            <script>
                async function go() {
                    const pass = document.getElementById('pw').value;
                    const res = await fetch('/api/stats', { headers: { 'Authorization': pass } });
                    if (res.ok) {
                        const data = await res.json();
                        document.getElementById('auth').style.display='none';
                        document.getElementById('dash').style.display='block';
                        document.getElementById('v').innerText = data.summary.totalVisits;
                        document.getElementById('i').innerText = data.summary.uniqueIPs;
                        document.querySelector('#t tbody').innerHTML = data.visits.map(v => \`
                            <tr>
                                <td>\${new Date(v.timestamp).toLocaleTimeString()}</td>
                                <td>\${v.ip}</td>
                                <td>\${v.path}</td>
                            </tr>
                        \`).join('');
                    } else alert('ACCESS_DENIED');
                }
            </script>
        </body>
        </html>
    `);
});

// Final fallback
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SERVER_RUNNING: ${PORT}`);
});
