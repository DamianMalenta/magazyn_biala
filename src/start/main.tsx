import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import StartApp from './StartApp'
import './start.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StartApp />
  </StrictMode>,
)
