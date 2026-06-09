import { useState } from 'react'
import { loadConfig } from '../lib/storage'

const SESSION_KEY = 'startpage-admin-session'

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === 'authenticated',
  )
  const [showLogin, setShowLogin] = useState(false)

  const login = (pin: string): boolean => {
    const attempt = pin.trim()
    const currentPin = loadConfig().adminPin.trim()
    if (attempt === currentPin) {
      sessionStorage.setItem(SESSION_KEY, 'authenticated')
      setIsAdmin(true)
      setShowLogin(false)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAdmin(false)
  }

  return { isAdmin, showLogin, setShowLogin, login, logout }
}
