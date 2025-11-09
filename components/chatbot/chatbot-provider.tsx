"use client"

import { useEffect, useState } from "react"
import { ChatWidget } from "./chat-widget"
import { useAuthContext } from "@/context/auth-context"

export function ChatbotProvider() {
  const { user } = useAuthContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  return <ChatWidget userType={user.type as "farmer" | "dhalari"} />
}
