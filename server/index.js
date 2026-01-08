const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Immediate Health Check
app.get('/health', (req, res) => res.status(200).send('HEALTHY_SYSTEM_V3'));

const distPath = path.join(__dirname, '../dist');
console.log(`📂 Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Safety for API requests
app.post('/api/collect', (req, res) => res.status(200).json({ status: 'ok' }));

// Standard SPA Route
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(200).send('<h1>ESCO.IO</h1><p>Neural link initializing... Refresh in 10 seconds.</p>');
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT} (0.0.0.0)`);
});
