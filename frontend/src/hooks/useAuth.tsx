import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { User, AuthResponse, ApiResponse } from '@shared/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async (email: string, password: string) => {
    const response = await axios.post<ApiResponse<AuthResponse>>('/api/auth/login', {
      email,
      password
    })

    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
    } else {
      throw new Error(response.data.error || 'Login failed')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await axios.post<ApiResponse<AuthResponse>>('/api/auth/register', {
      name,
      email,
      password
    })

    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
    } else {
      throw new Error(response.data.error || 'Registration failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // TODO: Validate token and get user info
    }
    setLoading(false)
  }, [])

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}