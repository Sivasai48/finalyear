import { type NextRequest, NextResponse } from "next/server"
import { notificationsDatabase } from "@/database/notifications"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })
    }

    const notifications = notificationsDatabase.getByUserId(userId)
    const unreadCount = notificationsDatabase.getUnreadCount(userId)

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const notification = notificationsDatabase.create(body)

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error("[v0] Error creating notification:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
