"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email?: string
  phone?: string
  type: "farmer" | "dhalari"
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean  // Added loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)  // Start as loading

  useEffect(() => {
    const saved = localStorage.getItem("auth-user")
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load auth user")
      }
    }
    setIsLoading(false)  // Done loading
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("auth-user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-user")
    localStorage.removeItem("auth-token")
    localStorage.removeItem("chat-farmer")
    localStorage.removeItem("chat-dhalari")
  }

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return context
}

