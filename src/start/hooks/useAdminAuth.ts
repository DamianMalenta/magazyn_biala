import { useEffect, useState } from 'react'

export function useAdminAuth(storedPin: string) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('startpage-admin-session')
    if (session === storedPin) setIsAdmin(true)
  }, [storedPin])

  const login = (pin: string): boolean => {
    if (pin === storedPin) {
      sessionStorage.setItem('startpage-admin-session', pin)
      setIsAdmin(true)
      setShowLogin(false)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('startpage-admin-session')
    setIsAdmin(false)
  }

  return { isAdmin, showLogin, setShowLogin, login, logout }
}
