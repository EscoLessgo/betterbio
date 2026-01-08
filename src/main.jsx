import * as THREE from 'three'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import SafeModeApp from './components/SafeModeApp';

// CRITICAL PRODUCTION FIX: Ensure THREE is global before ANY component loads
if (typeof window !== 'undefined') {
  window.THREE = THREE;
  console.log('--- 🌐 SYSTEM: THREE.js Global Link Established ---');
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Critical Runtime Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      // 🛡️ FAILOVER: Render 2D Safe Mode instead of crash screen
      return <SafeModeApp />;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
