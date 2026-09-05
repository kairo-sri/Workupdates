import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('wp_token')
    const stored = localStorage.getItem('wp_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('wp_token')
        localStorage.removeItem('wp_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { token, user: u } = await api.login(email, password)
    localStorage.setItem('wp_token', token)
    localStorage.setItem('wp_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('wp_token')
    localStorage.removeItem('wp_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
