# ESCO.IO - Neural Portfolio Matrix

A high-performance 3D portfolio built with React Three Fiber and integrated analytics tracking.

## 🚀 Railway Deployment Guide

### Prerequisites
- Railway account
- GitHub repository connected

### Quick Deploy

1. **Connect Repository**
   - Link this repo to Railway
   - Railway will auto-detect the Node.js environment

2. **Environment Variables**
   - No environment variables required for basic deployment
   - Analytics password is hardcoded (change in `server/index.js` for production)

3. **Build & Start Commands**
   Railway will automatically use:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

4. **Port Configuration**
   - The app automatically uses Railway's `PORT` environment variable
   - Default: 3001 (for local development)

### Admin Portal

Access analytics dashboard by appending `#admin` to your URL:
- **URL**: `https://your-railway-url.app/#admin`
- **Note**: No password required for view-only dashboard (secured by obfuscated URL hash for now).

### Local Development

```bash
# Install dependencies
npm install

# Run dev server (frontend only)
npm run dev

# Build production bundle
npm run build

# Start production server (with analytics)
npm start
```

### Project Structure

```
├── /src                 # React frontend (3D Portfolio)
│   ├── /components      # React Three Fiber components
│   └── /utils           # Analytics tracking
├── /server.js           # Express backend (Postgres Analytics)
└── /public              # Static assets (screenshots, videos)
```

### Analytics Features

- **Real-time visitor tracking**
- **IP geolocation**
- **Device & browser fingerprinting**
- **Node interaction metrics**
- **Password-protected dashboard**

### Performance

- 60FPS 3D rendering
- Optimized texture loading
- Non-blocking asset pipeline
- Sub-300ms API response times

---

**Built by ESCO** | Powered by Velarix Core v1.8.0
