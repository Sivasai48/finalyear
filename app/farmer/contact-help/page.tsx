"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Mail, MessageSquare, Loader2, ChevronDown } from "lucide-react"

export default function ContactHelpPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  })

  if (!user || user.type !== "farmer") {
    router.push("/")
    return null
  }

  const faqs = [
    {
      question: "How do I get crop predictions?",
      answer:
        "Go to the Crop Prediction section, enter your farm details including soil type, land size, and irrigation status. Our AI will provide personalized recommendations.",
    },
    {
      question: "What are the commission rates charged by traders?",
      answer:
        "Commission rates vary by trader (typically 2-5%). You can compare rates in the Find Traders section and choose the one that suits your needs.",
    },
    {
      question: "How often are market prices updated?",
      answer:
        "Market prices are updated daily based on APMC (Agricultural Produce Market Committee) data. Check the Price Prediction section for the latest trends.",
    },
    {
      question: "Can I export my prediction reports?",
      answer: "Yes, you can download prediction reports as PDF from each prediction page using the download button.",
    },
    {
      question: "How long does it take to connect with a trader?",
      answer:
        "After submitting your request, traders typically respond within 24-48 hours. You'll receive notifications on your dashboard.",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user.id }),
      })
      setSubmitted(true)
      setFormData({ subject: "", message: "" })
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error("Failed to submit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.push("/farmer/dashboard")} className="mb-6 gap-2 bg-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Get assistance and answers to common questions</p>
        </div>

        {/* Support Channels */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium">Phone Support</h3>
              </div>
              <p className="text-sm text-gray-600">Call us at 1800-123-FARM (Mon-Fri 9am-6pm IST)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Email Support</h3>
              </div>
              <p className="text-sm text-gray-600">Email us at support@agriconnect.com</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium">Live Chat</h3>
              </div>
              <p className="text-sm text-gray-600">Chat with our team in real-time (9am-9pm IST)</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>We'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Issue with crop prediction"
                  required
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue or question..."
                  required
                  rows={5}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Sending..." : "Send Message"}
              </Button>
              {submitted && (
                <p className="text-green-600 text-sm text-center">Message sent successfully! We'll reply soon.</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="font-medium text-left text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedFaq === i && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
