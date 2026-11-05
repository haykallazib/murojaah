import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthSessionProvider } from './contexts/AuthSessionContext.jsx'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthSessionProvider>
      <App />
    </AuthSessionProvider>
  </React.StrictMode>,
)
