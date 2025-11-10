"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Leaf, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AddCropPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    pricePerKg: "",
    location: "",
    description: "",
    phone: "",
  })

  useEffect(() => {
    if (!user || user.type !== "farmer") {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/crops/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          farmerId: user?.id,
          farmerEmail: user?.email,
          farmerName: user?.name || user?.email,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: t("addCrop.success") || "Success!",
          description: "Your crop has been added successfully and is now visible to traders.",
          variant: "default",
        })
        router.push("/farmer/my-crops")
      } else {
        toast({
          title: "Error",
          description: "Failed to add crop. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error adding crop:", error)
      toast({
        title: "Error",
        description: "Error adding crop. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">AgriConnect</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => router.push("/farmer/dashboard")} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("addCrop.title")}</CardTitle>
            <CardDescription>{t("addCrop.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cropName">{t("addCrop.cropName")}</Label>
                <Input
                  id="cropName"
                  placeholder={t("addCrop.cropNamePlaceholder")}
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t("addCrop.quantity")}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder={t("addCrop.quantityPlaceholder")}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">{t("addCrop.pricePerKg")}</Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    placeholder={t("addCrop.pricePlaceholder")}
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t("addCrop.location")}</Label>
                <Input
                  id="location"
                  placeholder={t("addCrop.locationPlaceholder")}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("addCrop.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("addCrop.phonePlaceholder")}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("addCrop.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("addCrop.descriptionPlaceholder")}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : t("common.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
