import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import * as THREE from 'three'
import './index.css'

// CRITICAL: Ensure THREE is globally available before R3F or Drei components try to access it
if (typeof window !== 'undefined') {
  window.THREE = THREE;
  console.log('🌐 Global THREE initialized');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
