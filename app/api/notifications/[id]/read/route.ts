import { type NextRequest, NextResponse } from "next/server"
import { notificationsDatabase } from "@/database/notifications"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = params.id

    if (notificationId === "all") {
      const { searchParams } = new URL(req.url)
      const userId = searchParams.get("userId")
      if (userId) {
        notificationsDatabase.markAllAsRead(userId)
        return NextResponse.json({ success: true, message: "All notifications marked as read" })
      }
    } else {
      const notification = notificationsDatabase.markAsRead(notificationId)
      if (!notification) {
        return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: notification })
    }
  } catch (error) {
    console.error("[v0] Error marking notification as read:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
