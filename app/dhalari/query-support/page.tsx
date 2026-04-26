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
          {t("market.back")}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("support.queryAndSupport")}</h1>
          <p className="text-gray-600">{t("support.getHelp")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Submit Query Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  {t("support.submitQuery")}
                </CardTitle>
                <CardDescription>{t("support.fillForm")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>{t("support.queryCategory")}</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("support.selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{t("support.technicalIssue")}</SelectItem>
                        <SelectItem value="payment">{t("support.paymentRelated")}</SelectItem>
                        <SelectItem value="crop">{t("support.cropInformation")}</SelectItem>
                        <SelectItem value="farmer">{t("support.farmerContact")}</SelectItem>
                        <SelectItem value="other">{t("support.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("support.subject")}</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t("support.subjectPlaceholder")}
                      required
                    />
                  </div>

                  <div>
                    <Label>{t("support.description")}</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t("support.descriptionPlaceholder")}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? t("support.submitting") : t("support.submitQueryBtn")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("support.contactSupport")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{t("support.phoneSupport")}</p>
                    <p className="text-sm text-gray-600">+91 1800-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">{t("support.emailSupport")}</p>
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
                <CardTitle>{t("support.platformInstructions")}</CardTitle>
                <CardDescription>{t("support.quickGuide")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{t("support.browseAvailCrops")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("support.browseAvailCropsDesc")}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{t("support.acceptDeals")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("support.acceptDealsDesc")}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{t("support.sendCropRequests")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("support.sendCropRequestsDesc")}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold mb-2">{t("support.trackEarnings")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("support.trackEarningsDesc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("support.faq")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="q1">
                    <AccordionTrigger>{t("support.faq1q")}</AccordionTrigger>
                    <AccordionContent>
                      {t("support.faq1a")}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>{t("support.faq2q")}</AccordionTrigger>
                    <AccordionContent>
                      {t("support.faq2a")}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3">
                    <AccordionTrigger>{t("support.faq3q")}</AccordionTrigger>
                    <AccordionContent>
                      {t("support.faq3a")}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q4">
                    <AccordionTrigger>{t("support.faq4q")}</AccordionTrigger>
                    <AccordionContent>
                      {t("support.faq4a")}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q5">
                    <AccordionTrigger>{t("support.faq5q")}</AccordionTrigger>
                    <AccordionContent>
                      {t("support.faq5a")}
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
