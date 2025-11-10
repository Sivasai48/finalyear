"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SendRequest() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cropRequired: "",
    quantityRequired: "",
    priceOffered: "",
    location: "",
    deliveryDate: "",
    additionalNotes: "",
  })

  const cropOptions = ["Rice", "Wheat", "Cotton", "Maize", "Sugarcane", "Groundnut", "Pulses", "Vegetables"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.cropRequired || !formData.quantityRequired || !formData.priceOffered) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/dhalari/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dhalariId: user?.id,
          dhalariName: user?.name || user?.email,
          dhalariPhone: user?.phone || "N/A",
          ...formData,
          quantityRequired: Number.parseFloat(formData.quantityRequired),
          priceOffered: Number.parseFloat(formData.priceOffered),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: "Request sent to farmers successfully",
        })
        router.push("/dhalari/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send request",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-2">Send Crop Request to Farmers</h1>
          <p className="text-gray-600 mb-6">Fill in the details of the crop you need. Farmers will be notified.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Crop Required *</Label>
                <Select
                  value={formData.cropRequired}
                  onValueChange={(value) => setFormData({ ...formData, cropRequired: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity Required (kg) *</Label>
                <Input
                  type="number"
                  value={formData.quantityRequired}
                  onChange={(e) => setFormData({ ...formData, quantityRequired: e.target.value })}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div>
                <Label>Price Offered (₹/kg) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceOffered}
                  onChange={(e) => setFormData({ ...formData, priceOffered: e.target.value })}
                  placeholder="Enter price per kg"
                  required
                />
              </div>

              <div>
                <Label>Delivery Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  required
                />
              </div>

              <div>
                <Label>Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Any specific requirements or details"
                rows={4}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Sending Request..." : "Send Request to Farmers"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
