import { useState, useEffect } from 'react'

interface User {
  username: string
  email?: string
  level: number
  total_points: number
  quiz_coins: number
  experience: number
  achievements: string[]
  badges: string[]
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, email?: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(userData))
        
        return { success: true, user: userData }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.detail }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Connection failed' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  }
}
