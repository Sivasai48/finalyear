"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { NotificationsList } from "@/components/notifications-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { NotificationsBell } from "@/components/notifications-bell"

export default function FarmerNotificationsPage() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (!user || user.type !== "farmer") {
      router.push("/")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* @ts-ignore */}
            <NotificationsBell userId={user?.id || user?.sub} userType="farmer" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <NotificationsList userType="farmer" />
      </main>
    </div>
  )
}
