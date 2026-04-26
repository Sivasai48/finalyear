"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useConnections } from "@/hooks/use-connections"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Search, Store, Phone, Mail, Award, Check, Clock, UserPlus, MessageCircle } from "lucide-react"
import { NotificationsBell } from "@/components/notifications-bell"
import { authFetch } from "@/lib/auth-utils"

interface Dhalari {
    id: string
    name: string
    business_name: string
    email: string
    phone: string
    location: string
    specialization: string[]
    verified: boolean
    is_connected?: boolean
}

export default function FindTradersPage() {
    const router = useRouter()
    const { user } = useAuthContext()
    const { toast } = useToast()
    // @ts-ignore
    const userId = user?.id || user?.sub
    const { sendRequest, cancelRequest, getRequestStatus } = useConnections(userId, "farmer")

    const [dhalaris, setDhalaris] = useState<Dhalari[]>([])
    const [filteredDhalaris, setFilteredDhalaris] = useState<Dhalari[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    const [selectedDhalari, setSelectedDhalari] = useState<Dhalari | null>(null)
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // Force re-render on connection state changes
    const [, setTick] = useState(0)

    useEffect(() => {
        if (!user || user.type !== "farmer") {
            router.push("/")
        } else {
            fetchDhalaris()
        }
    }, [user, router])

    useEffect(() => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            setFilteredDhalaris(dhalaris.filter(d =>
                d.business_name.toLowerCase().includes(lower) ||
                d.location.toLowerCase().includes(lower) ||
                d.specialization.some(s => s.toLowerCase().includes(lower))
            ))
        } else {
            setFilteredDhalaris(dhalaris)
        }
    }, [searchTerm, dhalaris])

    // Listen for sync events to re-render buttons
    useEffect(() => {
        const handler = () => setTick(t => t + 1)
        window.addEventListener("agricon_sync", handler)
        return () => window.removeEventListener("agricon_sync", handler)
    }, [])

    const fetchDhalaris = async () => {
        try {
            const response = await authFetch("http://127.0.0.1:8000/api/dhalaris")
            if (response.ok) {
                const data = await response.json()
                setDhalaris(data)
                setFilteredDhalaris(data)
            }
        } catch (error) {
            console.error("Error fetching dhalaris", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRequestToggle = (dhalari: Dhalari) => {
        if (!userId) return
        const { status, requestId } = getRequestStatus(userId, dhalari.id)

        if (status === "none" || status === "received") {
            // Open dialog to send request
            setSelectedDhalari(dhalari)
            setMessage(`Hi ${dhalari.business_name}, I am a farmer and I would like to connect with you regarding potential crop deals.`)
        } else if (status === "sent" && requestId) {
            // Cancel the request
            cancelRequest(requestId)
            toast({
                title: "Request Cancelled",
                description: `Connection request to ${dhalari.business_name} has been cancelled.`,
            })
        } else if (status === "connected") {
            // Go to connections/chat
            router.push("/farmer/connections")
        }
    }

    const handleSubmitRequest = async () => {
        if (!user || !selectedDhalari || !userId) return
        setSubmitting(true)

        try {
            // Save to localStorage via hook
            sendRequest(
                { id: userId, type: "farmer", name: user.email || "Farmer", phone: "" },
                { id: selectedDhalari.id, type: "dhalari", name: selectedDhalari.business_name, phone: selectedDhalari.phone },
                message
            )

            // Also send via API for backend tracking
            try {
                await authFetch("http://127.0.0.1:8000/api/trader-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        dhalari_id: selectedDhalari.id,
                        farmer_id: userId,
                        request_type: "contact",
                        message: message,
                    })
                })
            } catch {
                // API call is best-effort; localStorage is the primary store
            }

            toast({
                title: "Request Sent!",
                description: `Connection request sent to ${selectedDhalari.business_name}`,
            })
            setSelectedDhalari(null)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }

    const getButtonProps = (dhalari: Dhalari) => {
        if (!userId) return { label: "Request", icon: UserPlus, className: "bg-blue-600 hover:bg-blue-700", disabled: true }
        const { status } = getRequestStatus(userId, dhalari.id)

        switch (status) {
            case "sent":
                return {
                    label: "Requested",
                    icon: Clock,
                    className: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
                    disabled: false,
                }
            case "connected":
                return {
                    label: "Connected ✓",
                    icon: MessageCircle,
                    className: "bg-emerald-600 hover:bg-emerald-700 text-white",
                    disabled: false,
                }
            case "received":
                return {
                    label: "Accept Request",
                    icon: Check,
                    className: "bg-amber-500 hover:bg-amber-600 text-white",
                    disabled: false,
                }
            default:
                return {
                    label: "Request",
                    icon: UserPlus,
                    className: "bg-blue-600 hover:bg-blue-700 text-white",
                    disabled: false,
                }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold">Find Traders (Dhalaris)</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* @ts-ignore */}
                        <NotificationsBell userId={user?.id || user?.sub} userType="farmer" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect with Buyers</h2>
                    <p className="text-gray-600">Find and connect with verified Dhalaris in your region.</p>
                </div>

                <div className="mb-6 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by business name, location, or crop..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="text-center py-10">Loading traders...</p>
                ) : filteredDhalaris.length === 0 ? (
                    <div className="text-center py-10">
                        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No traders found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDhalaris.map((dhalari) => {
                            const btnProps = getButtonProps(dhalari)
                            const IconComp = btnProps.icon
                            return (
                                <Card key={dhalari.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                                    {dhalari.business_name}
                                                    {dhalari.verified && <Award className="w-4 h-4 text-emerald-500" />}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500 font-medium">{dhalari.name}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Store className="w-5 h-5 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                {dhalari.location}
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${getRequestStatus(userId, dhalari.id).status !== 'connected' ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                                                <Phone className="w-4 h-4" />
                                                {getRequestStatus(userId, dhalari.id).status === 'connected'
                                                    ? dhalari.phone
                                                    : "Hidden (Connect first)"}
                                            </div>

                                            {dhalari.specialization && dhalari.specialization.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {dhalari.specialization.map(spec => (
                                                        <Badge key={spec} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            className={`w-full ${btnProps.className}`}
                                            onClick={() => handleRequestToggle(dhalari)}
                                            disabled={btnProps.disabled}
                                        >
                                            <IconComp className="w-4 h-4 mr-2" />
                                            {btnProps.label}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>

            <Dialog open={!!selectedDhalari} onOpenChange={(open) => !open && setSelectedDhalari(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect with {selectedDhalari?.business_name}</DialogTitle>
                        <DialogDescription>
                            Send a message to introduce yourself.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Type your message..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedDhalari(null)}>Cancel</Button>
                        <Button onClick={handleSubmitRequest} disabled={submitting}>
                            {submitting ? "Sending..." : "Send Request"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
