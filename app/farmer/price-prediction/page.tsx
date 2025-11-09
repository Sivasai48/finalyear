"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function PricePredictionPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [cropInput, setCropInput] = useState("wheat")
  const [selectedCrop, setSelectedCrop] = useState("wheat")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("en-US", { month: "long" }))
  const [priceData, setPriceData] = useState(null)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  useEffect(() => {
    if (!user || user.type !== "farmer") {
      router.push("/")
      return
    }
    fetchPrices()
  }, [selectedCrop, selectedMonth, user, router])

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/market/prices?crop=${selectedCrop}&month=${selectedMonth}`)
      const data = await response.json()
      setPriceData(data)
    } catch (error) {
      console.error("Failed to fetch prices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchCrop = () => {
    if (cropInput.trim()) {
      setSelectedCrop(cropInput.trim().toLowerCase())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchCrop()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.push("/farmer/dashboard")} className="mb-6 gap-2 bg-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Prediction & Market Trends</h1>
          <p className="text-gray-600">Monitor market prices and make informed selling decisions</p>
        </div>

        {/* Crop and Month Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Crop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cropInput}
                  onChange={(e) => setCropInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter crop name (e.g., wheat, rice, cotton)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button onClick={handleSearchCrop} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">Suggested: wheat, rice, cotton, sugarcane</p>
            </CardContent>
          </Card>

          {/* Month Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Month</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : priceData ? (
          <div className="grid gap-6">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{priceData.currentPrice}</p>
                  <p className="text-xs text-gray-500 mt-2">per quintal</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">{priceData.selectedMonth} Price</p>
                  <p className="text-2xl font-bold text-blue-600">₹{priceData.monthPrice}</p>
                  <p className="text-xs text-gray-500 mt-2">historical</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Predicted Price</p>
                  <p className="text-2xl font-bold text-blue-600">₹{priceData.predictedPrice}</p>
                  <p className={`text-xs mt-2 ${priceData.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {priceData.priceChange >= 0 ? "+" : ""}
                    {priceData.priceChange}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Avg. APMC Price</p>
                  <p className="text-2xl font-bold text-amber-600">₹{priceData.apmcPrice}</p>
                  <p className="text-xs text-gray-500 mt-2">across India</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>12-Month Price Trend</CardTitle>
                <CardDescription>Historical and predicted prices for {selectedCrop}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `₹${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#10b981" name="Historical Price" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                      strokeDasharray="5 5"
                      name="Predicted Price"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Selling Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 font-medium mb-3">✓ {priceData.recommendation}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {priceData.tips?.map((tip: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
