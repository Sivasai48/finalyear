"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function CropPredictionPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cropType: "wheat",
    soilType: "loamy",
    landSize: "1",
    irrigation: "yes",
    region: "punjab",
  })
  const [result, setResult] = useState(null)

  if (!user || user.type !== "farmer") {
    router.push("/")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePredict = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/crops/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Prediction failed:", error)
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Prediction</CardTitle>
              <CardDescription>Get personalized crop recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Crop Type</label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                >
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Soil Type</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                >
                  <option value="loamy">Loamy</option>
                  <option value="clayey">Clayey</option>
                  <option value="sandy">Sandy</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Land Size (acres)</label>
                <input
                  type="number"
                  name="landSize"
                  value={formData.landSize}
                  onChange={handleInputChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Irrigation Available</label>
                <select
                  name="irrigation"
                  value={formData.irrigation}
                  onChange={handleInputChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-md"
                >
                  <option value="punjab">Punjab</option>
                  <option value="haryana">Haryana</option>
                  <option value="up">Uttar Pradesh</option>
                </select>
              </div>

              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Predicting..." : "Get Prediction"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Prediction Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-md">
                      <p className="text-sm text-gray-600">Expected Yield</p>
                      <p className="text-2xl font-bold text-emerald-600">{result.yield} quintals</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-md">
                      <p className="text-sm text-gray-600">Success Probability</p>
                      <p className="text-2xl font-bold text-blue-600">{result.success}%</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-md">
                      <p className="text-sm text-gray-600">Estimated Timeline</p>
                      <p className="text-lg font-semibold text-amber-600">{result.timeline} months</p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Best Practices:</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        {result.practices?.map((practice: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span>•</span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">Fill the form and click "Get Prediction" to see results</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
