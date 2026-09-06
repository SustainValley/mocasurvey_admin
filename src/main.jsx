import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import EventAnalyticsPanel from './EventAnalyticsPanel.jsx'
import './styles.css'
import './responsive.css'
import './eventAnalytics.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <EventAnalyticsPanel />
  </React.StrictMode>,
)
