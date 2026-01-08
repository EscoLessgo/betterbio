const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Immediate health check
app.get('/health', (req, res) => res.status(200).send('HEALTHY'));

// Static files
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// API
app.post('/api/collect', (req, res) => res.status(200).json({ status: 'ok' }));

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send('<html><body style="background:#000;color:#0ff;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh"><h1>SYSTEM_BOOTING // REFRESH_IN_30S</h1></body></html>');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NEURAL_LINK_ACTIVE on port ${PORT}`);
});
