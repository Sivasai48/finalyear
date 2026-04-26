"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { useConnections, Connection, ChatMessage } from "@/hooks/use-connections"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    ArrowLeft, Search, MessageCircle, Send, Phone, User,
    Users, Clock, CheckCheck, Smile, Store
} from "lucide-react"

export default function DhalariConnectionsPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuthContext()
    const { t } = useLanguage()
    // @ts-ignore
    const userId = user?.id || user?.sub
    const {
        getMyConnections, getMessages, sendMessage, getLastMessage,
        getReceivedRequests, acceptRequest, declineRequest
    } = useConnections(userId, "dhalari")

    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
    const [messageText, setMessageText] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState<"connections" | "requests">("connections")
    const chatEndRef = useRef<HTMLDivElement>(null)

    const myConnections = getMyConnections()
    const receivedRequests = getReceivedRequests()
    const messages = selectedConnection ? getMessages(selectedConnection.id) : []

    // Scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages.length])

    const filteredConnections = myConnections.filter(c => {
        const name = c.farmerName.toLowerCase()
        return name.includes(searchTerm.toLowerCase())
    })

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedConnection || !userId) return
        sendMessage(
            selectedConnection.id,
            userId,
            "dhalari",
            user?.email || "Dealer",
            messageText.trim()
        )
        setMessageText("")
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleAccept = (reqId: string) => {
        acceptRequest(reqId)
    }

    const handleDecline = (reqId: string) => {
        declineRequest(reqId)
    }

    const formatTime = (ts: string) => {
        const d = new Date(ts)
        const now = new Date()
        const isToday = d.toDateString() === now.toDateString()
        if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        return d.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!user || user.type !== "dhalari") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold mb-2">{t("chat.accessDenied")}</h2>
                    <p className="text-gray-600 mb-4">{t("chat.signInDealer")}</p>
                    <Button onClick={() => router.push("/dhalari/auth")} className="bg-blue-600 hover:bg-blue-700">
                        {t("dashboard.signIn")}
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-blue-700 text-white px-4 py-3 flex items-center gap-3 shadow-md z-10">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dhalari/dashboard")} className="text-white hover:bg-blue-600">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <MessageCircle className="w-6 h-6" />
                <h1 className="text-lg font-semibold flex-1">{t("chat.connectionsAndChat")}</h1>
                <Badge variant="secondary" className="bg-blue-600 text-white border-blue-500">
                    {myConnections.length} {t("chat.connected")}
                </Badge>
            </header>

            {/* Main Content — Split Panel */}
            <div className="flex-1 flex overflow-hidden">
                {/* ─── Left Panel: Contact List ─── */}
                <div className={`w-full md:w-96 bg-white border-r flex flex-col ${selectedConnection ? 'hidden md:flex' : 'flex'}`}>
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === "connections"
                                ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50"
                                : "text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setActiveTab("connections")}
                        >
                            <Users className="w-4 h-4 inline mr-1" />
                            {t("chat.connections")} ({myConnections.length})
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${activeTab === "requests"
                                ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50"
                                : "text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setActiveTab("requests")}
                        >
                            <Clock className="w-4 h-4 inline mr-1" />
                            {t("chat.requests")}
                            {receivedRequests.length > 0 && (
                                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                    {receivedRequests.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search */}
                    {activeTab === "connections" && (
                        <div className="p-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder={t("chat.searchConnections")}
                                    className="pl-9 bg-gray-50 border-gray-200"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* List */}
                    <ScrollArea className="flex-1">
                        {activeTab === "connections" ? (
                            filteredConnections.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <Users className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">{t("chat.noConnections")}</p>
                                    <p className="text-gray-400 text-xs mt-1">{t("chat.findFarmersHint")}</p>
                                    <Button
                                        variant="link"
                                        className="mt-3 text-blue-600"
                                        onClick={() => router.push("/dhalari/farmers")}
                                    >
                                        {t("actions.findFarmers")}
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredConnections.map(conn => {
                                        const lastMsg = getLastMessage(conn.id)
                                        const isActive = selectedConnection?.id === conn.id
                                        return (
                                            <button
                                                key={conn.id}
                                                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                                                onClick={() => setSelectedConnection(conn)}
                                            >
                                                {/* Avatar */}
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                                                    {conn.farmerName.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-semibold text-gray-900 truncate">{conn.farmerName}</span>
                                                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                                                            {lastMsg ? formatTime(lastMsg.timestamp) : formatTime(conn.connectedAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {lastMsg ? lastMsg.text : t("chat.startChatting")}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )
                        ) : (
                            /* Requests tab */
                            receivedRequests.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <Clock className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">{t("chat.noPendingRequests")}</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {receivedRequests.map(req => (
                                        <div key={req.id} className="p-4 hover:bg-gray-50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {req.fromName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{req.fromName}</p>
                                                    <p className="text-xs text-gray-500">{formatTime(req.createdAt)}</p>
                                                </div>
                                            </div>
                                            {req.message && (
                                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3 italic">
                                                    &ldquo;{req.message}&rdquo;
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                    onClick={() => handleAccept(req.id)}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDecline(req.id)}
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </ScrollArea>
                </div>

                {/* ─── Right Panel: Chat ─── */}
                <div className={`flex-1 flex flex-col ${!selectedConnection ? 'hidden md:flex' : 'flex'}`}>
                    {!selectedConnection ? (
                        /* No chat selected */
                        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle className="w-12 h-12 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-1">{t("chat.yourMessages")}</h3>
                                <p className="text-gray-500 text-sm">{t("chat.selectConnection")}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setSelectedConnection(null)}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedConnection.farmerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{selectedConnection.farmerName}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {selectedConnection.farmerPhone || "N/A"}
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                                    {t("chat.connected")}
                                </Badge>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 bg-[#e5ded8] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjAzKSIvPjwvc3ZnPg==')]">
                                <div className="p-4 space-y-2 min-h-full flex flex-col justify-end">
                                    {/* Connection notice */}
                                    <div className="flex justify-center mb-4">
                                        <span className="bg-white/80 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">
                                            {t("chat.connectedOn")} {new Date(selectedConnection.connectedAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {messages.length === 0 && (
                                        <div className="flex justify-center py-8">
                                            <span className="bg-yellow-100/80 text-yellow-700 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                                                {t("chat.sayHello")}
                                            </span>
                                        </div>
                                    )}

                                    {messages.map(msg => {
                                        const isMine = msg.senderId === userId
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${isMine
                                                        ? "bg-blue-100 text-gray-900 rounded-br-none"
                                                        : "bg-white text-gray-900 rounded-bl-none"
                                                        }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                                                    <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                        {isMine && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={chatEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Message Input */}
                            <div className="bg-white border-t px-3 py-2 flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 shrink-0">
                                    <Smile className="w-5 h-5" />
                                </Button>
                                <Input
                                    placeholder={t("chat.typeMessage")}
                                    className="flex-1 bg-gray-50 border-gray-200 rounded-full"
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <Button
                                    size="icon"
                                    disabled={!messageText.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 rounded-full shrink-0"
                                    onClick={handleSendMessage}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
