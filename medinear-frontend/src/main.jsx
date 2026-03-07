import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './animations.css'
import './mobile-optimization.css'
import App from './App.jsx'
import { initEnv } from './utils/envConfig'

// Initialize and validate environment configuration
initEnv();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
