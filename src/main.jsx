import * as THREE from 'three'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// CRITICAL PRODUCTION FIX: Ensure THREE is global before ANY component loads
if (typeof window !== 'undefined') {
  window.THREE = THREE;
  console.log('--- 🌐 SYSTEM: THREE.js Global Link Established ---');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
