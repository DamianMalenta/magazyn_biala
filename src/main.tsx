import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { InventoryProvider } from './context/InventoryProvider'
import { DesktopOnlyGuard } from './components/layout/DesktopOnlyGuard'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesktopOnlyGuard>
      <InventoryProvider>
        <App />
      </InventoryProvider>
    </DesktopOnlyGuard>
  </StrictMode>,
)
