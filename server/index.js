const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
// Railway provides the PORT environment variable
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Health check must be ultra-reliable
app.get('/health', (req, res) => {
    res.status(200).send('HEALTHY');
});

// 2. Static files from the VITE build
const distPath = path.resolve(__dirname, '..', 'dist');
console.log(`--- [SYSTEM] Serving from: ${distPath} ---`);
app.use(express.static(distPath));

// 3. API endpoints
app.post('/api/collect', (req, res) => {
    // Mock success for analytics
    res.status(200).json({ status: 'ok' });
});

// 4. SPA Fallback: Send index.html for any other route
app.get('*', (req, res) => {
    const indexPath = path.resolve(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('--- [ERROR] Could not send index.html ---', err);
            res.status(200).send(`
                <html>
                    <body style="background:#050505;color:#00ffff;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0">
                        <h1 style="color:#ff0077;border:1px solid #ff0077;padding:1rem">SYSTEM_INITIALIZING</h1>
                        <p>Neural Link in progress... Refresh in 15 seconds.</p>
                    </body>
                </html>
            `);
        }
    });
});

// 5. Explicitly bind to 0.0.0.0 for Railway/Cloudflare stability
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ======================================
    🚀 NEURAL_LINK_ESTABLISHED
    📍 PORT: ${PORT}
    🌐 HOST: 0.0.0.0
    ======================================
    `);
});
