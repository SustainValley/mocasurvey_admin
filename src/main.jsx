import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import BoothReadonlyOverride from './BoothReadonlyOverride.jsx'
import './styles.css'
import './readonly.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <BoothReadonlyOverride />
  </React.StrictMode>,
)
