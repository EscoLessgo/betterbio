import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import * as THREE from 'three'
import './index.css'

if (typeof window !== 'undefined') {
  window.THREE = THREE;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
