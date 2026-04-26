"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { NotificationsBell } from "@/components/notifications-bell"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Calendar, Phone, User, MessageSquare, Send, Inbox } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { authFetch } from "@/lib/auth-utils"

interface ContactRequest {
    id: string
    name: string
    phone: string
    status: string
    message: string
    createdAt: string
    type: "sent" | "received"
}

export default function DhalariContactRequests() {
    const router = useRouter()
    const { user, isLoading } = useAuthContext()
    const { t } = useLanguage()
    const { toast } = useToast()
    const [sentRequests, setSentRequests] = useState<ContactRequest[]>([])
    const [receivedRequests, setReceivedRequests] = useState<ContactRequest[]>([])
    const [loading, setLoading] = useState(true)

    // Confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [actionType, setActionType] = useState<"accepted" | "declined" | null>(null)
    const [selectedReqId, setSelectedReqId] = useState<string | null>(null)

    useEffect(() => {
        if (!isLoading && user) {
            fetchRequests()
        }
    }, [user, isLoading])

    const fetchRequests = async () => {
        // @ts-ignore
        const userId = user?.id || user?.sub
        if (!userId) {
            setLoading(false)
            return
        }

        try {
            // Fetch sent contact requests (dhalari sent to farmers)
            const sentResponse = await fetch(`http://localhost:8000/api/trader-requests/dhalari/${userId}`)
            if (sentResponse.ok) {
                const sentData = await sentResponse.json()
                // Filter only contact type requests sent by dhalari
                const contactSent = sentData.filter((item: any) => item.request_type === 'contact')
                const sent = contactSent.map((item: any) => ({
                    id: item.id,
                    name: item.farmer_name || "Farmer",
                    phone: item.farmer_phone || "N/A",
                    status: item.status,
                    message: item.message || "",
                    createdAt: item.created_at,
                    type: "sent" as const
                }))
                setSentRequests(sent)
            }

            // Fetch received contact requests (farmers sent to dhalari)
            const receivedResponse = await fetch(`http://localhost:8000/api/trader-requests/dhalari/${userId}/received`)
            if (receivedResponse.ok) {
                const receivedData = await receivedResponse.json()
                const received = receivedData.map((item: any) => ({
                    id: item.id,
                    name: item.farmer_name || "Farmer",
                    phone: item.farmer_phone || "N/A",
                    status: item.status,
                    message: item.message || "",
                    createdAt: item.created_at,
                    type: "received" as const
                }))
                setReceivedRequests(received)
            }
        } catch (error) {
            console.error("Error fetching contact requests:", error)
            toast({
                title: "Error",
                description: "Failed to load contact requests",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const initiateAction = (requestId: string, type: "accepted" | "declined") => {
        setSelectedReqId(requestId)
        setActionType(type)
        setConfirmOpen(true)
    }

    const handleConfirmAction = async () => {
        if (!selectedReqId || !actionType) {
            setConfirmOpen(false)
            return
        }

        try {
            const response = await authFetch(`http://localhost:8000/api/trader-requests/${selectedReqId}/dhalari-respond`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: actionType }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || "Failed to update")
            }

            toast({
                title: actionType === "accepted" ? "Contact Accepted!" : "Contact Declined",
                description: `The farmer has been notified.`,
                variant: actionType === "accepted" ? "default" : "destructive"
            })

            fetchRequests()
        } catch (error: any) {
            console.error("Error updating contact request:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to update request",
                variant: "destructive",
            })
        } finally {
            setConfirmOpen(false)
            setSelectedReqId(null)
            setActionType(null)
        }
    }

    const renderRequestCard = (req: ContactRequest, showActions: boolean) => (
        <Card key={req.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-600" />
                                {req.name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Phone className="w-4 h-4" />
                                {req.status === "accepted" || req.type === "sent" ? req.phone : "Hidden until accepted"}
                            </p>
                        </div>
                        <Badge
                            variant={req.status === "pending" ? "outline" : req.status === "accepted" ? "default" : "destructive"}
                            className={req.status === "accepted" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        >
                            {req.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                    </div>

                    {req.message && (
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 italic">
                            "{req.message}"
                        </div>
                    )}

                    {showActions && req.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={() => initiateAction(req.id, "accepted")}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                Accept
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => initiateAction(req.id, "declined")}
                                className="flex-1 bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            >
                                Decline
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    // Show loading while auth context is hydrating
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    // Show login prompt if not authenticated
    if (!user || user.type !== "dhalari") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="space-y-4 pt-6 text-center">
                        <h2 className="text-xl font-semibold">Access Denied</h2>
                        <p className="text-gray-600">Please sign in as a Dhalari to view contact requests.</p>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => router.push("/dhalari/auth")}
                        >
                            Sign in
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
            <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Contact Requests</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsBell userId={user?.id || "dhalari-001"} userType="dhalari" />
                        <LanguageSelector />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-gray-600 mb-6">Manage contact connections with farmers.</p>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <Tabs defaultValue="received" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="received" className="gap-2">
                                <Inbox className="w-4 h-4" />
                                Received ({receivedRequests.length})
                            </TabsTrigger>
                            <TabsTrigger value="sent" className="gap-2">
                                <Send className="w-4 h-4" />
                                Sent ({sentRequests.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="received">
                            {receivedRequests.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No contact requests received from farmers yet.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {receivedRequests.map((req) => renderRequestCard(req, true))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="sent">
                            {sentRequests.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">You haven't sent any contact requests to farmers.</p>
                                    <Button
                                        variant="link"
                                        onClick={() => router.push("/dhalari/farmers")}
                                        className="mt-2 text-emerald-600"
                                    >
                                        Find Farmers to Connect
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {sentRequests.map((req) => renderRequestCard(req, false))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </main>

            {/* Custom Confirmation Modal */}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => {
                            setConfirmOpen(false)
                            setSelectedReqId(null)
                            setActionType(null)
                        }}
                    />
                    <div className="relative z-10 bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-lg font-semibold mb-2">Confirm Action</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to {actionType} this contact request?
                            {actionType === 'accepted'
                                ? " You will be able to see the farmer's contact information."
                                : ' The farmer will be notified of your decision.'}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setConfirmOpen(false)
                                    setSelectedReqId(null)
                                    setActionType(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmAction}
                                className={actionType === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                                Confirm {actionType === 'accepted' ? 'Accept' : 'Decline'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
