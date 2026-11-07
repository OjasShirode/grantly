import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

// Right-click menu is switched off for the whole site
document.addEventListener('contextmenu', (e) => e.preventDefault())
// Pictures cannot be dragged out of the page
document.addEventListener('dragstart', (e) => { if (e.target instanceof HTMLImageElement) e.preventDefault() })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)