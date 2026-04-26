"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Send, Loader2, Leaf, RotateCcw } from "lucide-react"
import { useLanguage } from "@/context/language-context"

interface Message {
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: Date
}

type SupportedLang = "en" | "te" | "hi"

// ──────────────────────────────────────────
// Webhook Configuration (proxied through Next.js API to avoid CORS)
// ──────────────────────────────────────────
const WEBHOOK_PROXY_URL = "/api/chat/webhook"

async function sendToWebhook(
  message: string,
  lang: SupportedLang,
  userType: "farmer" | "dhalari"
): Promise<string | null> {
  try {
    const res = await fetch(WEBHOOK_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, language: lang, userType }),
    })
    if (!res.ok) return null

    const data = await res.json()
    // The proxy returns { output: "..." } but output might be a nested object or JSON string
    let output = data.output ?? data.response ?? data.text ?? data.message ?? data

    // If output is a string that looks like JSON, try to parse it
    if (typeof output === "string") {
      try {
        const parsed = JSON.parse(output)
        if (typeof parsed === "object" && parsed !== null) {
          output = parsed
        }
      } catch {
        // Not JSON — it's already a plain text string, use as-is
        return output
      }
    }

    // If output is an object, extract the text message from it
    if (typeof output === "object" && output !== null) {
      const text = output.answer || output.text || output.response || output.message || output.output
      if (typeof text === "string") return text
      // If still an object, try one more level deep
      if (typeof text === "object" && text !== null) {
        const deepText = text.answer || text.text || text.response || text.message
        if (typeof deepText === "string") return deepText
      }
      // Last resort: stringify but only the meaningful content
      return typeof text === "string" ? text : JSON.stringify(output)
    }

    return String(output)
  } catch {
    // Webhook unreachable
    return null
  }
}

// ──────────────────────────────────────────
// Quick suggestion chips
// ──────────────────────────────────────────

const QUICK_SUGGESTIONS = {
  en: ["🌾 Rice guide", "🧪 Fertilizers", "📊 Market prices", "🐛 Pest control"],
  te: ["🌾 వరి సాగు", "🧪 ఎరువులు", "📊 మార్కెట్ ధరలు", "🐛 తెగుళ్ల నివారణ"],
  hi: ["🌾 धान की खेती", "🧪 उर्वरक जानकारी", "📊 बाजार भाव", "🐛 कीट नियंत्रण"]
}

// ──────────────────────────────────────────
// Chat Widget Component
// ──────────────────────────────────────────

export function ChatWidget({ userType }: { userType: "farmer" | "dhalari" }) {
  const { language } = useLanguage() as { language: SupportedLang }
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greetings = {
        en: userType === "farmer"
          ? `🙏 **Namaste Kisan!** I'm your Agriculture Advisor.\n\nAsk me about:\n🌾 Crops, 🧪 Fertilizers, 🐛 Pests, 📊 Prices`
          : `🙏 **Welcome Dealer!** I'm your Agriculture Business Advisor.`,
        te: userType === "farmer"
          ? `🙏 **నమస్కారం రైతు బిడ్డ!** నేను మీ వ్యవసాయ సలహాదారుని.\n\nనన్ను అడగండి:\n🌾 పంటలు, 🧪 ఎరువులు, 🐛 తెగుళ్లు, 📊 ధరలు`
          : `🙏 **స్వాగతం వ్యాపారి!** నేను మీ వ్యవసాయ వ్యాపార సలహాదారుని.`,
        hi: userType === "farmer"
          ? `🙏 **नमस्ते किसान भाई!** मैं आपका कृषि सलाहकार हूँ।\n\nमुझसे पूछें:\n🌾 फसलें, 🧪 उर्वरक, 🐛 कीट, 📊 भाव`
          : `🙏 **स्वागत है व्यापारी!** मैं आपका कृषि व्यापार सलाहकार हूँ।`
      }

      setMessages([{
        id: "init",
        sender: "bot",
        text: greetings[language],
        timestamp: new Date(),
      }])
    }
  }, [language, userType])

  // Clear chat when switching languages
  useEffect(() => {
    localStorage.removeItem(`agri-chat-${userType}`)
    setMessages([])
  }, [language, userType])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const text = overrideText || inputValue
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Send message to webhook and get response
    let response = await sendToWebhook(text.trim(), language, userType)
    if (!response) {
      // Webhook unavailable — show error message
      const errorMessages = {
        en: "⚠️ Sorry, I couldn't connect to the server. Please try again later.",
        te: "⚠️ క్షమించండి, సర్వర్‌కు కనెక్ట్ కాలేకపోయాను. దయచేసి తర్వాత మళ్ళీ ప్రయత్నించండి.",
        hi: "⚠️ क्षमा करें, सर्वर से कनेक्ट नहीं हो पाया। कृपया बाद में पुनः प्रयास करें।"
      }
      response = errorMessages[language]
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: response,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, botMessage])
    setIsLoading(false)
  }, [inputValue, language, userType])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem(`agri-chat-${userType}`)
  }

  // Simple markdown-like rendering
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-green-700 hover:from-emerald-600 hover:to-green-800 group"
          size="icon"
        >
          <div className="flex flex-col items-center gap-0.5">
            <Leaf className="w-6 h-6 group-hover:animate-bounce" />
            <span className="text-[9px] font-bold leading-none">KRISHI</span>
            <span className="text-[8px] uppercase opacity-80">{language}</span>
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-[420px] h-[550px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 border-0 rounded-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">🌾 Krishi Advisor ({language.toUpperCase()})</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse"></span>
                  Agriculture Expert • Always Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="text-white/70 hover:bg-white/20 w-8 h-8"
                title="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:bg-white/20 w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-emerald-50/50 to-white" style={{ minHeight: 0 }}>
            <div className="p-3 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-[13px] leading-relaxed shadow-sm ${msg.sender === "user"
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                      }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{renderText(msg.text)}</div>
                    <div className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-emerald-100 text-right" : "text-gray-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="bg-white text-gray-700 px-4 py-3 rounded-xl rounded-bl-sm flex items-center gap-2 border border-gray-100 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-gray-50 border-t flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS[language]?.map(s => (
                <button
                  key={s}
                  className="text-[11px] px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-50 transition-colors"
                  onClick={() => handleSendMessage(s)}
                  disabled={isLoading}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t bg-white px-3 py-2.5 flex gap-2">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                language === "te" ? "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి..." :
                  language === "hi" ? "अपना प्रश्न यहाँ टाइप करें..." :
                    "Ask about crops, fertilizers..."
              }
              className="text-sm bg-gray-50 border-gray-200 rounded-full px-4"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-full shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
