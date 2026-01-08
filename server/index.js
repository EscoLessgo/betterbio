const express = require('express');
const cors = require('cors');
const useragent = require('useragent');
const path = require('path');
const { insertView, getAnalytics, getStats } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = "Poncholove20!!";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Middle-ware to parse location from IP
async function getLocation(ip) {
    if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';
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
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ua = useragent.parse(req.headers['user-agent']);
    const { path, referrer } = req.body;

    const location = await getLocation(ip);
    const os = ua.os.toString();
    const browser = ua.toAgent();
    const device = ua.device.toString();

    insertView.run(ip, location, os, browser, device, path, referrer);
    res.status(200).json({ status: 'tracked' });
});

// Admin Authentication Middleware
const auth = (req, res, next) => {
    const password = req.query.pass || req.body.password;
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).send('Unauthorized. Please provide the internal clearance code.');
    }
};

// Admin Dashboard DATA
app.get('/api/admin/stats', auth, (req, res) => {
    const stats = getStats();
    const recent = getAnalytics(200);
    res.json({ stats, recent });
});

// Simple Admin Portal HTML
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SYSTEM_ANALYTICS // VELARIX_CORE</title>
            <style>
                body { background: #050505; color: #00ffff; font-family: 'Courier New', monospace; margin: 2rem; }
                .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
                .card { border: 1px solid #00ffff; padding: 1rem; background: #0a0a0a; box-shadow: 0 0 10px rgba(0,255,255,0.1); }
                .label { font-size: 0.7rem; color: #ff0077; text-transform: uppercase; margin-bottom: 0.5rem; }
                .value { font-size: 1.5rem; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.8rem; }
                th, td { border: 1px solid #111; padding: 0.8rem; text-align: left; }
                th { background: #111; color: #ff0077; text-transform: uppercase; }
                tr:hover { background: #111; }
                .login-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; }
                input { background: #000; border: 1px solid #00ffff; color: #00ffff; padding: 0.8rem; width: 300px; margin-bottom: 1rem; }
                button { background: #00ffff; color: #000; border: none; padding: 0.8rem 2rem; cursor: pointer; font-weight: bold; }
                #dashboard { display: none; }
            </style>
        </head>
        <body>
            <div id="login" class="login-container">
                <h1 style="color: #ff0077">CORE_ACCESS_REQUIRED</h1>
                <input type="password" id="pass" placeholder="ENTER_SYSTEM_PASS">
                <button onclick="loadStats()">INITIALIZE_SYNC</button>
            </div>

            <div id="dashboard">
                <h1>NEURAL_TRAFFIC_ANALYSIS</h1>
                <div class="grid">
                    <div class="card"><div class="label">Total Views</div><div class="value" id="v-total">-</div></div>
                    <div class="card"><div class="label">Unique Assets</div><div class="value" id="v-unique">-</div></div>
                    <div class="card"><div class="label">Active OS</div><div class="value" id="v-os">-</div></div>
                    <div class="card"><div class="label">Primary Loc</div><div class="value" id="v-loc">-</div></div>
                </div>
                <h3>RECENT_PINGS</h3>
                <table id="recent-list">
                    <thead>
                        <tr>
                            <th>TIMESTAMP</th>
                            <th>IP_ADDRESS</th>
                            <th>LOCATION</th>
                            <th>DEVICE/OS</th>
                            <th>BROWSER</th>
                            <th>PATH</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>

            <script>
                async function loadStats() {
                    const pass = document.getElementById('pass').value;
                    try {
                        const res = await fetch(\`/api/admin/stats?pass=\${encodeURIComponent(pass)}\`);
                        if (!res.ok) throw new Error('FORBIDDEN');
                        const data = await res.json();
                        
                        document.getElementById('login').style.display = 'none';
                        document.getElementById('dashboard').style.display = 'block';

                        document.getElementById('v-total').innerText = data.stats.totalViews;
                        document.getElementById('v-unique').innerText = data.stats.uniqueIps;
                        document.getElementById('v-os').innerText = data.stats.browsers[0]?.browser || 'N/A';
                        document.getElementById('v-loc').innerText = data.stats.locations[0]?.location || 'N/A';

                        const tbody = document.querySelector('#recent-list tbody');
                        tbody.innerHTML = data.recent.map(r => \`
                            <tr>
                                <td>\${new Date(r.timestamp).toLocaleString()}</td>
                                <td>\${r.ip}</td>
                                <td>\${r.location}</td>
                                <td>\${r.device} (\${r.os})</td>
                                <td>\${r.browser}</td>
                                <td>\${r.path}</td>
                            </tr>
                        \`).join('');

                    } catch (e) {
                        alert('ACCESS_DENIED: INVALID_CLEARANCE_CODE');
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Catch-all for SPA (Express v5 compatible)
app.use((req, res, next) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
        next();
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Analytics Server running on port ${PORT}`);
});
