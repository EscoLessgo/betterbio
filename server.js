const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Global Error Handlers
process.on('uncaughtException', err => console.error('UNCAUGHT', err));
process.on('unhandledRejection', err => console.error('UNHANDLED', err));

console.log('--- ROOT SERVER STARTING ---');
console.log('CWD:', process.cwd());

// 1. Health
app.get('/health', (req, res) => res.send('OK'));

// 2. Serve Static or Fallback
// Try to find dist
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
    console.log('Serving existing dist folder');
    app.use(express.static(distPath));
} else {
    console.log('Dist folder missing - serving fallback');
}

// 3. Admin & API Stubs
app.use(express.json());

// 3. Admin & API Stubs
app.get('/admin', (req, res) => res.send('<h1>ADMIN ONLINE</h1>'));

// ANALYTICS PROXY: Connects to Central Data Hub if configured
app.post('/api/collect', async (req, res) => {
    const hubUrl = process.env.DATA_HUB_URL;
    if (hubUrl) {
        try {
            // Native node fetch (Node 18+)
            const response = await fetch(hubUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...req.body, source: 'ruckie-portfolio' })
            });
            if (response.ok) return res.json({ ok: true, forwarded: true });
        } catch (e) {
            console.error("Link to Central Hub failed:", e.message);
        }
    }
    // Fallback: Local logging
    // console.log('Local Analytics:', req.body);
    res.json({ ok: true, local: true });
});
app.get('/api/stats', (req, res) => res.json({ visits: 0 }));

// 4. Catch-all
app.use((req, res) => {
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(200).send('<h1>SYSTEM ONLINE - WAITING FOR BUILD</h1><p>The server is up, but the frontend build seems to have failed.</p>');
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`SERVER RUNNING ON ${PORT}`));

// Prevent exit on signals to avoid "npm error command failed"
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Cleaning up...');
    process.exit(0);
});
