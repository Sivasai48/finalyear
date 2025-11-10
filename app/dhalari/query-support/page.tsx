"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, HelpCircle, Phone, Mail, MessageCircle } from "lucide-react"

export default function QuerySupportPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
  })

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.subject || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success!",
        description: "Your query has been submitted. We'll respond within 24 hours.",
      })

      setFormData({ category: "", subject: "", description: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit query",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Query & Support</h1>
          <p className="text-gray-600">Get help with your questions or report issues</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Submit Query Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Submit a Query
                </CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Query Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="payment">Payment Related</SelectItem>
                        <SelectItem value="crop">Crop Information</SelectItem>
                        <SelectItem value="farmer">Farmer Contact</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Subject *</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your query in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? "Submitting..." : "Submit Query"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">+91 1800-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@agriconnect.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-gray-600">+91 98765-43210</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions & FAQs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Platform Instructions</CardTitle>
                <CardDescription>Quick guide to using AgriConnect as a trader</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">1. Browse Available Crops</h3>
                    <p className="text-sm text-gray-600">
                      Go to "View Requests" to see all crop listings from farmers with details like quantity, price, and
                      location.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="font-semibold mb-2">2. Accept Deals</h3>
                    <p className="text-sm text-gray-600">
                      Click "Accept" on any listing to finalize the deal. You'll earn 5% commission on the total value.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-semibold mb-2">3. Send Crop Requests</h3>
                    <p className="text-sm text-gray-600">
                      Use "Send Crop Request" to tell farmers what crops you're looking for. Farmers will be notified.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold mb-2">4. Track Earnings</h3>
                    <p className="text-sm text-gray-600">
                      View your analytics and earnings breakdown in the dashboard and analytics sections.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="q1">
                    <AccordionTrigger>How do I contact farmers?</AccordionTrigger>
                    <AccordionContent>
                      Each crop listing shows the farmer's phone number. You can call or WhatsApp them directly to
                      discuss the deal details.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>What is the commission rate?</AccordionTrigger>
                    <AccordionContent>
                      You earn 5% commission on every deal you accept. For example, on a ₹100,000 deal, you earn ₹5,000.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3">
                    <AccordionTrigger>How do I get paid?</AccordionTrigger>
                    <AccordionContent>
                      Earnings are tracked automatically. Set up your bank details in your profile to receive direct
                      transfers at the end of each month.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q4">
                    <AccordionTrigger>Can I decline a deal after accepting?</AccordionTrigger>
                    <AccordionContent>
                      Once accepted, deals are finalized. Please contact support immediately if you need to cancel due
                      to exceptional circumstances.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q5">
                    <AccordionTrigger>How do I update my profile?</AccordionTrigger>
                    <AccordionContent>
                      Go to "My Profile" in the quick actions section to edit your business information, crop
                      specializations, and contact details.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
