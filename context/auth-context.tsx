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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("auth-user")
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load auth user")
      }
    }
    setMounted(true)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("auth-user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-user")
    localStorage.removeItem("chat-farmer")
    localStorage.removeItem("chat-dhalari")
  }

  if (!mounted) return null

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return context
}
