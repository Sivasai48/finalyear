export interface Notification {
  id: string
  userId: string
  userType: "farmer" | "dhalari"
  type: "deal_accepted" | "deal_declined" | "new_crop_listing" | "new_request"
  title: string
  message: string
  cropName?: string
  farmerName?: string
  dhalariName?: string
  amount?: number
  read: boolean
  createdAt: string
}

class NotificationsDatabase {
  private notifications: Notification[] = [
    {
      id: "notif-001",
      userId: "farmer-001",
      userType: "farmer",
      type: "deal_accepted",
      title: "Deal Accepted!",
      message: "Your wheat crop (500 Kg) has been accepted by Raj Traders",
      cropName: "Wheat",
      dhalariName: "Raj Traders",
      amount: 15000,
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]

  getAll() {
    return [...this.notifications]
  }

  getByUserId(userId: string) {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getUnreadCount(userId: string) {
    return this.notifications.filter((n) => n.userId === userId && !n.read).length
  }

  create(notification: Omit<Notification, "id" | "createdAt">) {
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    this.notifications.unshift(newNotif)
    return newNotif
  }

  markAsRead(notificationId: string) {
    const notif = this.notifications.find((n) => n.id === notificationId)
    if (notif) {
      notif.read = true
    }
    return notif
  }

  markAllAsRead(userId: string) {
    this.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => {
        n.read = true
      })
  }

  delete(notificationId: string) {
    const index = this.notifications.findIndex((n) => n.id === notificationId)
    if (index > -1) {
      this.notifications.splice(index, 1)
      return true
    }
    return false
  }
}

export const notificationsDatabase = new NotificationsDatabase()
