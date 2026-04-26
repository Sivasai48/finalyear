"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Trash2, Bell, CheckCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function NotificationsList({ userType }: { userType: "farmer" | "dhalari" }) {
    const router = useRouter()
    const { user } = useAuthContext()
    const { toast } = useToast()
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        // @ts-ignore
        const userId = user?.id || user?.sub
        if (!userId) return

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/notifications/${userId}`)
            if (!response.ok) throw new Error("Failed to fetch")
            const data = await response.json()
            setNotifications(data)
        } catch (error) {
            console.error("[v0] Error fetching notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
    }, [user])

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/notifications/${id}/read`, {
                method: "PUT"
            })
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            }
        } catch (error) {
            console.error("Error marking as read", error)
        }
    }

    const markAllRead = async () => {
        // @ts-ignore
        const userId = user?.id || user?.sub
        if (!userId) return

        try {
            await fetch(`http://127.0.0.1:8000/api/notifications/mark-all-read/${userId}`, { method: "PUT" })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            toast({ title: "Success", description: "All notifications marked as read" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to mark all as read", variant: "destructive" })
        }
    }

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await fetch(`http://127.0.0.1:8000/api/notifications/${id}`, { method: "DELETE" })
            setNotifications(prev => prev.filter(n => n.id !== id))
            toast({ title: "Deleted", description: "Notification removed" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
        }
    }

    if (notifications.length === 0 && !loading) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Notifications</h2>
                {notifications.some(n => !n.read) && (
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.map((notification) => (
                <Card
                    key={notification.id}
                    className={`transition-all hover:shadow-md ${!notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white'}`}
                >
                    <CardContent className="p-4 flex gap-4">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`} />

                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {notification.title}
                                </h3>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(notification.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed">
                                {notification.message}
                            </p>

                            {(notification.type === 'new_request' || notification.type === 'connection_request') && (
                                <div className="pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-white hover:bg-gray-50 text-xs h-8"
                                        onClick={() => {
                                            if (userType === 'farmer') {
                                                router.push('/farmer/dealer-requests')
                                            } else {
                                                router.push('/dhalari/farmers') // or wherever dhalari sees requests
                                            }
                                        }}
                                    >
                                        View details
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            {!notification.read && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                    onClick={(e) => markAsRead(notification.id, e)}
                                    title="Mark as read"
                                >
                                    <Check className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => deleteNotification(notification.id, e)}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
