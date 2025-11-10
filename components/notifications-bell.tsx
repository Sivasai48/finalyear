"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface NotificationsBellProps {
  userId: string
  userType: "farmer" | "dhalari"
}

export function NotificationsBell({ userId, userType }: NotificationsBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`/api/notifications?userId=${userId}`)
        const data = await response.json()
        if (data.success) {
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error("[v0] Error fetching notifications:", error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [userId])

  const handleViewNotifications = () => {
    router.push(`/${userType}/notifications`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleViewNotifications}>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Notifications</span>
            <span className="text-xs text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "No new notifications"}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
