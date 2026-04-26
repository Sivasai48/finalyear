"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Phone, MessageSquare, User, Send, Inbox } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

export default function FarmerContactRequests() {
    const router = useRouter()
    const { user } = useAuthContext()
    const { toast } = useToast()
    const [sentRequests, setSentRequests] = useState<ContactRequest[]>([])
    const [receivedRequests, setReceivedRequests] = useState<ContactRequest[]>([])
    const [loading, setLoading] = useState(true)

    // Confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [actionType, setActionType] = useState<"accepted" | "declined" | null>(null)
    const [selectedReqId, setSelectedReqId] = useState<string | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [user])

    const fetchRequests = async () => {
        try {
            // @ts-ignore
            const userId = user?.id || user?.sub
            if (!userId) {
                setLoading(false)
                return
            }

            // Fetch all requests for this farmer
            const response = await authFetch(`http://localhost:8000/api/trader-requests/farmer/${userId}`)
            if (!response.ok) throw new Error("Failed to fetch")

            const data = await response.json()

            // Filter contact requests only
            const contactRequests = data.filter((item: any) => item.request_type === 'contact')

            // Separate into sent (farmer sent to dhalari) and received (dhalari sent to farmer)
            // Farmer sends contact requests when farmer_id matches and they initiated
            // Received means dhalari initiated contact to farmer

            // For now, we'll check if dhalari_name exists - those are received from dhalaris
            const received = contactRequests.map((item: any) => ({
                id: item.id,
                name: item.dhalari_name || "Unknown Dealer",
                phone: item.dhalari_phone || "N/A",
                status: item.status,
                message: item.message || "",
                createdAt: item.created_at,
                type: "received" as const
            }))

            setReceivedRequests(received)

            // Fetch sent requests - contact requests farmer sent to dhalaris
            const sentResponse = await authFetch(`http://localhost:8000/api/trader-requests/farmer/${userId}/sent`)
            if (sentResponse.ok) {
                const sentData = await sentResponse.json()
                const sent = sentData.map((item: any) => ({
                    id: item.id,
                    name: item.dhalari_name || "Unknown Dealer",
                    phone: item.dhalari_phone || "N/A",
                    status: item.status,
                    message: item.message || "",
                    createdAt: item.created_at,
                    type: "sent" as const
                }))
                setSentRequests(sent)
            }
        } catch (error: any) {
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
            const response = await authFetch(`http://localhost:8000/api/trader-requests/${selectedReqId}`, {
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
                description: `The dealer has been notified.`,
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
        <Card key={req.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        {req.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="w-4 h-4" />
                        {req.status === "accepted" || req.type === "sent" ? req.phone : "Hidden until accepted"}
                    </p>
                </div>
                <Badge variant={req.status === "pending" ? "outline" : req.status === "accepted" ? "default" : "destructive"}>
                    {req.status}
                </Badge>
            </div>

            <div className="space-y-3">
                {req.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                )}

                {req.message && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{req.message}</p>
                    </div>
                )}
            </div>

            {showActions && req.status === "pending" && (
                <div className="mt-4 flex gap-2">
                    <Button onClick={() => initiateAction(req.id, "accepted")} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        Accept
                    </Button>
                    <Button variant="outline" onClick={() => initiateAction(req.id, "declined")} className="flex-1 bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                        Decline
                    </Button>
                </div>
            )}
        </Card>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
            <div className="max-w-6xl mx-auto">
                <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>

                <h1 className="text-3xl font-bold mb-2">Contact Requests</h1>
                <p className="text-gray-600 mb-6">Manage your contact connections with dealers.</p>

                {loading ? (
                    <p>Loading...</p>
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
                                <Card className="p-8 text-center">
                                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No contact requests received from dealers</p>
                                </Card>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {receivedRequests.map((req) => renderRequestCard(req, true))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="sent">
                            {sentRequests.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">You haven't sent any contact requests to dealers</p>
                                    <Button
                                        variant="link"
                                        onClick={() => router.push("/farmer/find-traders")}
                                        className="mt-2 text-emerald-600"
                                    >
                                        Find Traders to Connect
                                    </Button>
                                </Card>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {sentRequests.map((req) => renderRequestCard(req, false))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>

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
                                ? ' The dealer will be able to see your contact information.'
                                : ' The dealer will be notified of your decision.'}
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
