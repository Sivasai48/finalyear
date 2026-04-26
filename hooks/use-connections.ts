"use client"

import { useState, useEffect, useCallback } from "react"

// ─── Types ───────────────────────────────────────────────────────────
export interface ConnectionRequest {
    id: string
    fromId: string
    fromType: "farmer" | "dhalari"
    fromName: string
    fromPhone?: string
    toId: string
    toType: "farmer" | "dhalari"
    toName: string
    toPhone?: string
    message: string
    status: "pending" | "accepted" | "declined"
    createdAt: string
}

export interface Connection {
    id: string
    farmerId: string
    farmerName: string
    farmerPhone?: string
    dhalariId: string
    dhalariName: string
    dhalariPhone?: string
    connectedAt: string
}

export interface ChatMessage {
    id: string
    connectionId: string
    senderId: string
    senderType: "farmer" | "dhalari"
    senderName: string
    text: string
    timestamp: string
}

// ─── Storage helpers ─────────────────────────────────────────────────
const KEYS = {
    requests: "agricon_requests",
    connections: "agricon_connections",
    messages: "agricon_messages",
}

function readStore<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    try {
        return JSON.parse(localStorage.getItem(key) || "[]")
    } catch {
        return []
    }
}

function writeStore<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data))
}

function uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

// ─── Custom event for cross-component sync ───────────────────────────
const SYNC_EVENT = "agricon_sync"

function emitSync() {
    window.dispatchEvent(new Event(SYNC_EVENT))
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useConnections(userId?: string, userType?: "farmer" | "dhalari") {
    const [requests, setRequests] = useState<ConnectionRequest[]>([])
    const [connections, setConnections] = useState<Connection[]>([])
    const [messages, setMessages] = useState<ChatMessage[]>([])

    // Reload from localStorage
    const reload = useCallback(() => {
        setRequests(readStore<ConnectionRequest>(KEYS.requests))
        setConnections(readStore<Connection>(KEYS.connections))
        setMessages(readStore<ChatMessage>(KEYS.messages))
    }, [])

    useEffect(() => {
        reload()
        window.addEventListener(SYNC_EVENT, reload)
        // Poll every 2s for cross-tab sync
        const interval = setInterval(reload, 2000)
        return () => {
            window.removeEventListener(SYNC_EVENT, reload)
            clearInterval(interval)
        }
    }, [reload])

    // ── Request lifecycle ──────────────────────────────────────────────

    /** Send a connection request */
    const sendRequest = useCallback((
        from: { id: string; type: "farmer" | "dhalari"; name: string; phone?: string },
        to: { id: string; type: "farmer" | "dhalari"; name: string; phone?: string },
        message: string
    ) => {
        const all = readStore<ConnectionRequest>(KEYS.requests)

        // Check duplicate
        const exists = all.find(
            r => r.fromId === from.id && r.toId === to.id && r.status === "pending"
        )
        if (exists) return exists

        const req: ConnectionRequest = {
            id: uid(),
            fromId: from.id,
            fromType: from.type,
            fromName: from.name,
            fromPhone: from.phone,
            toId: to.id,
            toType: to.type,
            toName: to.name,
            toPhone: to.phone,
            message,
            status: "pending",
            createdAt: new Date().toISOString(),
        }
        all.push(req)
        writeStore(KEYS.requests, all)
        emitSync()
        return req
    }, [])

    /** Cancel a pending request (sender side) */
    const cancelRequest = useCallback((requestId: string) => {
        const all = readStore<ConnectionRequest>(KEYS.requests)
        const updated = all.filter(r => r.id !== requestId)
        writeStore(KEYS.requests, updated)
        emitSync()
    }, [])

    /** Accept a request → creates connection */
    const acceptRequest = useCallback((requestId: string) => {
        const allReqs = readStore<ConnectionRequest>(KEYS.requests)
        const req = allReqs.find(r => r.id === requestId)
        if (!req) return

        // Update request status
        req.status = "accepted"
        writeStore(KEYS.requests, allReqs)

        // Create connection
        const allConns = readStore<Connection>(KEYS.connections)
        const farmer = req.fromType === "farmer"
            ? { id: req.fromId, name: req.fromName, phone: req.fromPhone }
            : { id: req.toId, name: req.toName, phone: req.toPhone }
        const dhalari = req.fromType === "dhalari"
            ? { id: req.fromId, name: req.fromName, phone: req.fromPhone }
            : { id: req.toId, name: req.toName, phone: req.toPhone }

        // Prevent duplicate connection
        const alreadyConnected = allConns.find(
            c => c.farmerId === farmer.id && c.dhalariId === dhalari.id
        )
        if (!alreadyConnected) {
            allConns.push({
                id: uid(),
                farmerId: farmer.id,
                farmerName: farmer.name,
                farmerPhone: farmer.phone,
                dhalariId: dhalari.id,
                dhalariName: dhalari.name,
                dhalariPhone: dhalari.phone,
                connectedAt: new Date().toISOString(),
            })
            writeStore(KEYS.connections, allConns)
        }
        emitSync()
    }, [])

    /** Decline a request */
    const declineRequest = useCallback((requestId: string) => {
        const allReqs = readStore<ConnectionRequest>(KEYS.requests)
        const req = allReqs.find(r => r.id === requestId)
        if (req) {
            req.status = "declined"
            writeStore(KEYS.requests, allReqs)
            emitSync()
        }
    }, [])

    // ── Status checks ──────────────────────────────────────────────────

    /** Get the relationship status between current user and another user */
    const getRequestStatus = useCallback((
        myId: string,
        otherId: string
    ): { status: "none" | "sent" | "received" | "connected"; requestId?: string } => {
        const allConns = readStore<Connection>(KEYS.connections)
        const connected = allConns.find(
            c => (c.farmerId === myId && c.dhalariId === otherId) ||
                (c.dhalariId === myId && c.farmerId === otherId)
        )
        if (connected) return { status: "connected" }

        const allReqs = readStore<ConnectionRequest>(KEYS.requests)
        const sent = allReqs.find(r => r.fromId === myId && r.toId === otherId && r.status === "pending")
        if (sent) return { status: "sent", requestId: sent.id }

        const received = allReqs.find(r => r.fromId === otherId && r.toId === myId && r.status === "pending")
        if (received) return { status: "received", requestId: received.id }

        return { status: "none" }
    }, [])

    // ── Filtered data for current user ─────────────────────────────────

    /** Get pending requests received by current user */
    const getReceivedRequests = useCallback((): ConnectionRequest[] => {
        if (!userId) return []
        return requests.filter(r => r.toId === userId && r.status === "pending")
    }, [requests, userId])

    /** Get pending requests sent by current user */
    const getSentRequests = useCallback((): ConnectionRequest[] => {
        if (!userId) return []
        return requests.filter(r => r.fromId === userId && r.status === "pending")
    }, [requests, userId])

    /** Get connections for current user */
    const getMyConnections = useCallback((): Connection[] => {
        if (!userId) return []
        return connections.filter(c => c.farmerId === userId || c.dhalariId === userId)
    }, [connections, userId])

    // ── Chat ───────────────────────────────────────────────────────────

    /** Get messages for a specific connection */
    const getMessages = useCallback((connectionId: string): ChatMessage[] => {
        return messages.filter(m => m.connectionId === connectionId)
    }, [messages])

    /** Send a chat message */
    const sendMessage = useCallback((
        connectionId: string,
        senderId: string,
        senderType: "farmer" | "dhalari",
        senderName: string,
        text: string
    ) => {
        const allMsgs = readStore<ChatMessage>(KEYS.messages)
        const msg: ChatMessage = {
            id: uid(),
            connectionId,
            senderId,
            senderType,
            senderName,
            text,
            timestamp: new Date().toISOString(),
        }
        allMsgs.push(msg)
        writeStore(KEYS.messages, allMsgs)
        emitSync()
        return msg
    }, [])

    /** Get the last message for a connection (for preview) */
    const getLastMessage = useCallback((connectionId: string): ChatMessage | null => {
        const msgs = readStore<ChatMessage>(KEYS.messages)
            .filter(m => m.connectionId === connectionId)
        return msgs.length > 0 ? msgs[msgs.length - 1] : null
    }, [])

    return {
        // Data
        requests,
        connections,
        messages,
        // Request actions
        sendRequest,
        cancelRequest,
        acceptRequest,
        declineRequest,
        // Status
        getRequestStatus,
        // Filtered
        getReceivedRequests,
        getSentRequests,
        getMyConnections,
        // Chat
        getMessages,
        sendMessage,
        getLastMessage,
        // Refresh
        reload,
    }
}
