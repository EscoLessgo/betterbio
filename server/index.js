const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- EMERGENCY CRASH PROTECTION ---
process.on('uncaughtException', (err) => {
    console.error('CRITICAL_UNCAUGHT_ERR:', err);
});

app.use(cors());
app.use(express.json());

// Immediate Health Check for Railway Gateway
app.get('/health', (req, res) => {
    console.log('--- 🩺 HEALTH_CHECK_RECEIVED ---');
    res.status(200).send('HEALTHY');
});

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Simplified tracking to avoid any external network hangs during request
app.post('/api/collect', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Admin fallback
app.get('/admin', (req, res) => res.send('<h1>Admin Panel</h1><p>Active (In-Memory)</p>'));

// Standard SPA Route
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send('<h1>ESCO.IO</h1><p>Initializing Neural Link... Refresh in 10s.</p>');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ====================================
    🚀 SERVER_STARTED
    📍 PORT: ${PORT}
    🌐 HOST: 0.0.0.0
    ====================================
    `);
});
