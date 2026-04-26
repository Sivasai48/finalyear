"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { NotificationsBell } from "@/components/notifications-bell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Leaf, Users, HelpCircle, LogOut, Package, MessageSquare, IndianRupee, Sprout, X, Loader2, CheckCircle2, AlertCircle, Calculator, ArrowUpRight, ArrowDownRight, Minus, Sparkles } from "lucide-react"

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuthContext()
  const { t } = useLanguage()
  const [stats, setStats] = useState<{
    activeCrops: number
    cropRequests: number
    contactRequests: number
    totalRequests: number
    avgPrice: number
    successRate: number
    monthlyStats: any[]
  }>({
    activeCrops: 0,
    cropRequests: 0,
    contactRequests: 0,
    totalRequests: 0,
    avgPrice: 0,
    successRate: 0,
    monthlyStats: [],
  })
  const [loading, setLoading] = useState(true)

  // Crop Calculator state
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcLoading, setCalcLoading] = useState(false)
  const [crops, setCrops] = useState<any[]>([])
  const [marketPrices, setMarketPrices] = useState<any[]>([])
  const [traderRequests, setTraderRequests] = useState<any[]>([])

  // Crop Recommendation state
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [recLoading, setRecLoading] = useState(false)
  const [recResult, setRecResult] = useState<{
    success: boolean
    recommended_crop?: string
    message?: string
    error?: string
  } | null>(null)
  const [recInputs, setRecInputs] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  })

  // Price Recommendation state
  const [showPricePredict, setShowPricePredict] = useState(false)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceOptionsLoading, setPriceOptionsLoading] = useState(false)
  const [priceResult, setPriceResult] = useState<{
    success: boolean
    predicted_price_per_kg?: number
    error?: string
  } | null>(null)
  const [priceInputs, setPriceInputs] = useState({
    crop: "",
    season: "",
    month: "",
    disaster: "",
    condition: "",
    temp: "",
  })
  const [priceOptions, setPriceOptions] = useState<{
    Crop?: string[]
    Season?: string[]
    Month?: string[]
    "Disaster Happen in last 3 months"?: string[]
    "Vegetable Condition"?: string[]
  }>({})

  useEffect(() => {
    if (!isLoading && user && user.type === "farmer") {
      fetchStats()
    }
  }, [user, isLoading])

  const fetchStats = async () => {
    try {
      // @ts-ignore
      const userId = user?.id || user?.sub
      const response = await fetch(`http://localhost:8000/api/farmers/${userId}/stats`)
      if (!response.ok) throw new Error("Failed to fetch stats")

      const data = await response.json()

      // Fetch requests to get separate counts for crop and contact requests
      const requestsResponse = await fetch(`http://localhost:8000/api/trader-requests/farmer/${userId}`)
      let cropRequests = 0
      let contactRequests = 0

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        cropRequests = requestsData.filter((r: any) => r.request_type === 'crop_deal').length
        contactRequests = requestsData.filter((r: any) => r.request_type === 'contact').length
      }

      setStats({
        ...data,
        cropRequests,
        contactRequests,
      })
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCalcData = async () => {
    setCalcLoading(true)
    try {
      // @ts-ignore
      const userId = user?.id || user?.sub
      const [cropsRes, pricesRes, requestsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/crops/farmer/${userId}`),
        fetch(`http://localhost:8000/api/market-prices/`),
        fetch(`http://localhost:8000/api/trader-requests/farmer/${userId}`),
      ])
      if (cropsRes.ok) {
        const data = await cropsRes.json()
        setCrops(Array.isArray(data) ? data : [])
      }
      if (pricesRes.ok) {
        const data = await pricesRes.json()
        setMarketPrices(Array.isArray(data) ? data : [])
      }
      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setTraderRequests(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error("Error fetching calculator data:", e)
    } finally {
      setCalcLoading(false)
    }
  }

  const openCalculator = () => {
    setShowCalculator(true)
    fetchCalcData()
  }

  const getMarketPrice = (cropName: string) => {
    const match = marketPrices.find((mp: any) => mp.crop_name?.toLowerCase() === cropName?.toLowerCase())
    return match ? match.current_price : null
  }

  const handleRecInputChange = (field: string, value: string) => {
    setRecInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleGetRecommendation = async () => {
    setRecLoading(true)
    setRecResult(null)
    try {
      const payload = {
        N: parseFloat(recInputs.N),
        P: parseFloat(recInputs.P),
        K: parseFloat(recInputs.K),
        temperature: parseFloat(recInputs.temperature),
        humidity: parseFloat(recInputs.humidity),
        ph: parseFloat(recInputs.ph),
        rainfall: parseFloat(recInputs.rainfall),
      }

      // Validate all fields are numbers
      for (const [key, val] of Object.entries(payload)) {
        if (isNaN(val)) {
          setRecResult({ success: false, error: `Invalid value for ${key}. Please enter a number.` })
          setRecLoading(false)
          return
        }
      }

      const response = await fetch("/api/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setRecResult(data)
    } catch (error: any) {
      setRecResult({ success: false, error: "Failed to connect to the recommendation service. Make sure the ML server is running on port 5000." })
    } finally {
      setRecLoading(false)
    }
  }

  const handleResetRecommendation = () => {
    setRecInputs({ N: "", P: "", K: "", temperature: "", humidity: "", ph: "", rainfall: "" })
    setRecResult(null)
  }

  // ── Price Recommendation handlers ─────────────────────────────────
  const fetchPriceOptions = async () => {
    setPriceOptionsLoading(true)
    try {
      const res = await fetch("/api/crop-price/options")
      if (res.ok) {
        const data = await res.json()
        setPriceOptions(data)
      }
    } catch (e) {
      console.error("Error fetching price options:", e)
    } finally {
      setPriceOptionsLoading(false)
    }
  }

  const openPricePredict = () => {
    setShowPricePredict(true)
    handleResetPrice()
    fetchPriceOptions()
  }

  const handlePriceinputChange = (field: string, value: string) => {
    setPriceInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handlePredictPrice = async () => {
    setPriceLoading(true)
    setPriceResult(null)
    try {
      const payload = {
        crop: priceInputs.crop,
        season: priceInputs.season,
        month: priceInputs.month,
        disaster: priceInputs.disaster,
        condition: priceInputs.condition,
        temp: parseFloat(priceInputs.temp),
      }
      if (isNaN(payload.temp)) {
        setPriceResult({ success: false, error: "Please enter a valid temperature." })
        setPriceLoading(false)
        return
      }
      const res = await fetch("/api/crop-price/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setPriceResult(data)
    } catch (error) {
      setPriceResult({ success: false, error: "Failed to connect to the price prediction service. Make sure the ML server is running on port 8001." })
    } finally {
      setPriceLoading(false)
    }
  }

  const handleResetPrice = () => {
    setPriceInputs({ crop: "", season: "", month: "", disaster: "", condition: "", temp: "" })
    setPriceResult(null)
  }

  // Show loading while auth context is hydrating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // NO REDIRECT - just show login prompt if not authenticated
  if (!user || user.type !== "farmer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t("dashboard.farmerDashboard")}</CardTitle>
            <CardDescription>{t("dashboard.pleaseSignIn")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push("/farmer/auth")}
            >
              {t("dashboard.signIn")}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              {t("dashboard.goHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const recFields = [
    { key: "N", label: "Nitrogen (N)", unit: "mg/kg", placeholder: "e.g. 90", min: 0, max: 300 },
    { key: "P", label: "Phosphorus (P)", unit: "mg/kg", placeholder: "e.g. 42", min: 0, max: 200 },
    { key: "K", label: "Potassium (K)", unit: "mg/kg", placeholder: "e.g. 43", min: 0, max: 300 },
    { key: "temperature", label: "Temperature", unit: "°C", placeholder: "e.g. 20.87", min: -10, max: 60 },
    { key: "humidity", label: "Humidity", unit: "%", placeholder: "e.g. 82", min: 0, max: 100 },
    { key: "ph", label: "Soil pH", unit: "pH", placeholder: "e.g. 6.5", min: 0, max: 14 },
    { key: "rainfall", label: "Rainfall", unit: "mm", placeholder: "e.g. 202.9", min: 0, max: 1000 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">AgriConnect - {t("farmer.welcome").split(",")[0]}</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsBell userId={user?.id || "farmer-001"} userType="farmer" />
            <button
              onClick={openCalculator}
              className="relative p-2 rounded-full hover:bg-emerald-100 transition-colors group"
              title="Crop Calculator"
            >
              <Calculator className="w-5 h-5 text-gray-600 group-hover:text-emerald-700" />
            </button>
            <LanguageSelector />
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("farmer.welcome")}</h1>
          <p className="text-gray-600">{t("farmer.subtitle")}</p>
        </div>

        {/* Stats Grid - Colored Cards like Dhalari Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
            onClick={() => router.push("/farmer/my-crops")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">{t("farmer.activeCrops")}</CardTitle>
              <Leaf className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{loading ? "..." : stats.activeCrops}</div>
              <p className="text-xs text-emerald-600">{t("dashboard.currentlyListed")}</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            onClick={() => router.push("/farmer/dealer-requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">{t("dashboard.cropRequests")}</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{loading ? "..." : stats.cropRequests}</div>
              <p className="text-xs text-blue-600">{t("dashboard.fromDealers")}</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            onClick={() => router.push("/farmer/contact-requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">{t("dashboard.contactRequests")}</CardTitle>
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{loading ? "..." : stats.contactRequests}</div>
              <p className="text-xs text-purple-600">{t("dashboard.connectionRequests")}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">{t("farmer.avgPrice")}</CardTitle>
              <IndianRupee className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800">₹{loading ? "..." : stats.avgPrice}</div>
              <p className="text-xs text-amber-600">{t("farmer.perQuintal")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Statistics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            {t("stats.performanceStatistics")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Success Rate */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.dealSuccessRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-emerald-600">
                    {loading ? "..." : `${stats.successRate}%`}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${stats.successRate >= 70 ? "bg-emerald-100 text-emerald-700" :
                    stats.successRate >= 40 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                    {stats.successRate >= 70 ? t("stats.excellent") : stats.successRate >= 40 ? t("stats.good") : t("stats.starting")}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${stats.successRate >= 70 ? "bg-emerald-500" :
                      stats.successRate >= 40 ? "bg-amber-500" : "bg-blue-500"
                      }`}
                    style={{ width: `${Math.min(stats.successRate, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t("stats.basedOnDeals")}
                </p>
              </CardContent>
            </Card>

            {/* Request Summary */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.requestSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.cropDeals")}</span>
                    <span className="font-bold text-blue-600">{loading ? "..." : stats.cropRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("dashboard.contactRequests")}</span>
                    <span className="font-bold text-purple-600">{loading ? "..." : stats.contactRequests}</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.total")}</span>
                    <span className="font-bold text-gray-800">
                      {loading ? "..." : stats.cropRequests + stats.contactRequests}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.yourStatus")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.activeCrops")}</span>
                    <span className="font-bold text-emerald-600">{loading ? "..." : stats.activeCrops}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.avgPriceQuintal")}</span>
                    <span className="font-bold text-amber-600">₹{loading ? "..." : stats.avgPrice}</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.profileStatus")}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{t("stats.active")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts and Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("stats.monthlyPerformanceChart")}</CardTitle>
                <CardDescription>{t("stats.chartDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="cropsAdded" name="Crops Added" fill="#10b981" />
                    <Bar yAxisId="left" dataKey="requests" name="Requests" fill="#3b82f6" />
                    <Bar yAxisId="left" dataKey="quantitySold" name="Qty Sold (Tons)" fill="#f59e0b" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="moneyGained"
                      name="Revenue (₹)"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("farmer.quickActions")}</CardTitle>
                <CardDescription>{t("actions.manageActivities")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-10"
                  onClick={() => router.push("/farmer/add-crop")}
                >
                  {t("farmer.addMyCrop")}
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-10"
                  onClick={() => router.push("/farmer/dealer-requests")}
                >
                  {t("dashboard.cropRequests")} ({stats.cropRequests})
                </Button>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 h-10"
                  onClick={() => router.push("/farmer/contact-requests")}
                >
                  {t("dashboard.contactRequests")} ({stats.contactRequests})
                </Button>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 h-10"
                  onClick={() => router.push("/farmer/connections")}
                >
                  {t("actions.connectionsChat")}
                </Button>
                {/* Crop Recommendation Button */}
                <Button
                  className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 h-10 text-white font-semibold gap-2"
                  onClick={() => { setShowRecommendation(true); handleResetRecommendation() }}
                >
                  <Sprout className="w-4 h-4" />
                  🌱 Crop Recommendation
                </Button>
                {/* Price Recommendation Button */}
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 h-10 text-white font-semibold gap-2"
                  onClick={openPricePredict}
                >
                  <Sparkles className="w-4 h-4" />
                  💰 Price Recommendation
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/farmer/find-traders")}
                >
                  {t("farmer.findTraders")}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => router.push("/farmer/profile")}
                  >
                    {t("common.myProfile")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-amber-900">{t("farmer.needHelp")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => router.push("/farmer/contact-help")}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {t("farmer.support")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Crop Recommendation Inline Panel */}
        {showRecommendation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
              {/* Panel Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-lime-500 to-green-600 rounded-t-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sprout className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-lg font-bold text-white">🌾 Crop Recommendation</h2>
                    <p className="text-xs text-lime-100">Enter your soil &amp; weather data to get the best crop suggestion</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecommendation(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="p-6">
                {/* Input Fields Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {recFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={`rec-${field.key}`} className="text-sm font-medium text-gray-700">
                        {field.label} <span className="text-xs text-gray-400">({field.unit})</span>
                      </Label>
                      <Input
                        id={`rec-${field.key}`}
                        type="number"
                        step="any"
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        value={recInputs[field.key as keyof typeof recInputs]}
                        onChange={(e) => handleRecInputChange(field.key, e.target.value)}
                        className="h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Button
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold h-11"
                    onClick={handleGetRecommendation}
                    disabled={recLoading || Object.values(recInputs).some((v) => v === "")}
                  >
                    {recLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sprout className="w-4 h-4 mr-2" />
                        Get Recommendation
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 bg-transparent"
                    onClick={handleResetRecommendation}
                  >
                    Reset
                  </Button>
                </div>

                {/* Result Display */}
                {recResult && (
                  <div className={`rounded-xl border-2 p-5 transition-all duration-300 ${recResult.success
                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-lime-50"
                    : "border-red-300 bg-gradient-to-br from-red-50 to-orange-50"
                    }`}>
                    {recResult.success ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          <h3 className="text-lg font-bold text-emerald-800">Recommendation Ready!</h3>
                        </div>
                        <div className="flex items-center justify-center py-4">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 mb-3 shadow-lg">
                              <Sprout className="w-10 h-10 text-white" />
                            </div>
                            <p className="text-3xl font-extrabold text-emerald-700 capitalize">
                              {recResult.recommended_crop}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">{recResult.message}</p>
                          </div>
                        </div>
                        {/* Input echo */}
                        <div className="bg-white/60 rounded-lg p-3 mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Your Input Parameters:</p>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            {recFields.map((f) => (
                              <div key={f.key} className="bg-emerald-50 rounded px-2 py-1">
                                <span className="text-gray-500">{f.label.split(" ")[0]}:</span>{" "}
                                <span className="font-semibold text-emerald-700">{recInputs[f.key as keyof typeof recInputs]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-red-800">Error</h3>
                          <p className="text-sm text-red-600">{recResult.error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Info section */}
                {!recResult && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">💡 Tips for accurate results:</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Get a soil test report for N, P, K, and pH values</li>
                      <li>Use local weather data for temperature, humidity, and rainfall</li>
                      <li>Nitrogen: 0–300 mg/kg • Phosphorus: 0–200 mg/kg • Potassium: 0–300 mg/kg</li>
                      <li>Temperature: -10 to 60°C • Humidity: 0–100% • pH: 0–14 • Rainfall: 0–1000 mm</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Price Recommendation Modal */}
        {showPricePredict && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-700 animate-in fade-in zoom-in-95 duration-200" style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
              {/* Panel Header */}
              <div className="sticky top-0 z-10 rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-gray-700/50" style={{ background: 'linear-gradient(135deg, #1e1e3f, #2a2a5a)' }}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">💰 Price Recommendation</h2>
                    <p className="text-xs text-gray-400">Predict the market price for your crop</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPricePredict(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="p-6">
                {priceOptionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-3" />
                    <p className="text-gray-400">Loading options...</p>
                  </div>
                ) : (
                  <>
                    {/* Input Fields Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Crop / Vegetable */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Crop / Vegetable</label>
                        <select
                          value={priceInputs.crop}
                          onChange={(e) => handlePriceinputChange("crop", e.target.value)}
                          className="w-full h-10 rounded-lg border border-gray-600 bg-gray-800/80 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-800">Select crop</option>
                          {(priceOptions?.Crop || []).map((v) => (
                            <option key={v} value={v} className="bg-gray-800">{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Season */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Season</label>
                        <select
                          value={priceInputs.season}
                          onChange={(e) => handlePriceinputChange("season", e.target.value)}
                          className="w-full h-10 rounded-lg border border-gray-600 bg-gray-800/80 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-800">Select season</option>
                          {(priceOptions?.Season || []).map((v) => (
                            <option key={v} value={v} className="bg-gray-800">{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Month */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Month</label>
                        <select
                          value={priceInputs.month}
                          onChange={(e) => handlePriceinputChange("month", e.target.value)}
                          className="w-full h-10 rounded-lg border border-gray-600 bg-gray-800/80 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-800">Select month</option>
                          {(priceOptions?.Month || []).map((v) => (
                            <option key={v} value={v} className="bg-gray-800">{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Disaster */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Disaster (Last 3 Months)</label>
                        <select
                          value={priceInputs.disaster}
                          onChange={(e) => handlePriceinputChange("disaster", e.target.value)}
                          className="w-full h-10 rounded-lg border border-gray-600 bg-gray-800/80 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-800">Select disaster</option>
                          {(priceOptions?.["Disaster Happen in last 3 months"] || []).map((v) => (
                            <option key={v} value={v} className="bg-gray-800">{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Vegetable Condition */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vegetable Condition</label>
                        <select
                          value={priceInputs.condition}
                          onChange={(e) => handlePriceinputChange("condition", e.target.value)}
                          className="w-full h-10 rounded-lg border border-gray-600 bg-gray-800/80 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-800">Select condition</option>
                          {(priceOptions?.["Vegetable Condition"] || []).map((v) => (
                            <option key={v} value={v} className="bg-gray-800">{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Temperature */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Temperature</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 35"
                            value={priceInputs.temp}
                            onChange={(e) => handlePriceinputChange("temp", e.target.value)}
                            className="flex-1 h-10 rounded-lg border border-gray-600 bg-gray-800/80 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                          />
                          <span className="text-xs font-bold text-cyan-400 bg-cyan-900/40 px-2.5 py-1.5 rounded-lg border border-cyan-700/50">
                            {priceInputs.temp ? `${priceInputs.temp} °C` : "°C"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Predict Button */}
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-700 text-white font-bold text-base rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 mb-5"
                      onClick={handlePredictPrice}
                      disabled={priceLoading || !priceInputs.crop || !priceInputs.season || !priceInputs.month || !priceInputs.disaster || !priceInputs.condition || !priceInputs.temp}
                    >
                      {priceLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Predicting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Predict Price
                        </>
                      )}
                    </Button>

                    {/* Result Display */}
                    {priceResult && (
                      <div className={`rounded-xl border-2 p-5 transition-all duration-300 ${
                        priceResult.success
                          ? "border-emerald-500/50 bg-gradient-to-br from-emerald-900/40 to-teal-900/30"
                          : "border-red-500/50 bg-gradient-to-br from-red-900/40 to-orange-900/30"
                      }`}>
                        {priceResult.success ? (
                          <div className="space-y-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                              <h3 className="text-lg font-bold text-emerald-300">Price Predicted!</h3>
                            </div>
                            <div className="py-4">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-3 shadow-lg shadow-emerald-500/30">
                                <IndianRupee className="w-10 h-10 text-white" />
                              </div>
                              <p className="text-4xl font-extrabold text-white">
                                ₹{priceResult.predicted_price_per_kg}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">per kg (predicted)</p>
                            </div>
                            {/* Input echo */}
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-500 mb-2">Your Input:</p>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-gray-800/50 rounded px-2 py-1">
                                  <span className="text-gray-500">Crop:</span>{" "}
                                  <span className="font-semibold text-violet-300">{priceInputs.crop}</span>
                                </div>
                                <div className="bg-gray-800/50 rounded px-2 py-1">
                                  <span className="text-gray-500">Season:</span>{" "}
                                  <span className="font-semibold text-violet-300">{priceInputs.season}</span>
                                </div>
                                <div className="bg-gray-800/50 rounded px-2 py-1">
                                  <span className="text-gray-500">Month:</span>{" "}
                                  <span className="font-semibold text-violet-300">{priceInputs.month}</span>
                                </div>
                                <div className="bg-gray-800/50 rounded px-2 py-1">
                                  <span className="text-gray-500">Disaster:</span>{" "}
                                  <span className="font-semibold text-violet-300">{priceInputs.disaster}</span>
                                </div>
                                <div className="bg-gray-800/50 rounded px-2 py-1">
                                  <span className="text-gray-500">Condition:</span>{" "}
                                  <span className="font-semibold text-violet-300">{priceInputs.condition}</span>
                                </div>
                                <div className="bg-gray-800/50 rounded px-2 py-1">
                                  <span className="text-gray-500">Temp:</span>{" "}
                                  <span className="font-semibold text-cyan-300">{priceInputs.temp}°C</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <h3 className="font-bold text-red-300">Error</h3>
                              <p className="text-sm text-red-400">{priceResult.error}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reset button */}
                    {priceResult && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          className="h-10 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white bg-transparent"
                          onClick={handleResetPrice}
                        >
                          Try Another Prediction
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Crop Calculator Inline Panel */}
        {showCalculator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white border border-blue-200 animate-in fade-in zoom-in-95 duration-200">
              {/* Panel Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-lg font-bold text-white">📊 Crop Calculations</h2>
                    <p className="text-xs text-blue-100">Detailed revenue &amp; pricing breakdown for your crops</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="p-6">
                {calcLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-gray-500">Loading your crop data...</p>
                  </div>
                ) : crops.length === 0 ? (
                  <div className="text-center py-12">
                    <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No crops listed yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add your first crop to see calculations here</p>
                    <Button
                      className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => { setShowCalculator(false); router.push("/farmer/add-crop") }}
                    >
                      Add My Crop
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Summary Cards */}
                    {(() => {
                      const totalKgs = crops.reduce((sum: number, c: any) => sum + (c.quantity || 0), 0)
                      const totalQuintals = totalKgs / 100
                      const totalRevenue = crops.reduce((sum: number, c: any) => sum + (c.quantity || 0) * (c.expected_price || 0), 0)
                      const activeCrops = crops.filter((c: any) => c.status === "available").length
                      const soldCrops = crops.filter((c: any) => c.status === "sold").length
                      const avgPricePerKg = totalKgs > 0 ? totalRevenue / totalKgs : 0
                      const avgPricePerQuintal = avgPricePerKg * 100
                      const totalDeals = traderRequests.filter((r: any) => r.request_type === "crop_deal").length
                      const acceptedDeals = traderRequests.filter((r: any) => r.request_type === "crop_deal" && r.status === "accepted").length
                      const successRate = totalDeals > 0 ? ((acceptedDeals / totalDeals) * 100) : 0
                      return (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200">
                              <p className="text-xs text-blue-600 font-medium">Total Crops</p>
                              <p className="text-2xl font-bold text-blue-800">{crops.length}</p>
                              <p className="text-[10px] text-blue-500">{activeCrops} available • {soldCrops} sold</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center border border-emerald-200">
                              <p className="text-xs text-emerald-600 font-medium">Total Quantity</p>
                              <p className="text-2xl font-bold text-emerald-800">{totalKgs.toLocaleString("en-IN")}</p>
                              <p className="text-[10px] text-emerald-500">kgs ({totalQuintals.toFixed(2)} quintals)</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center border border-amber-200">
                              <p className="text-xs text-amber-600 font-medium">Expected Revenue</p>
                              <p className="text-2xl font-bold text-amber-800">₹{totalRevenue.toLocaleString("en-IN")}</p>
                              <p className="text-[10px] text-amber-500">total kgs × price/kg</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center border border-purple-200">
                              <p className="text-xs text-purple-600 font-medium">Avg Price</p>
                              <p className="text-2xl font-bold text-purple-800">₹{avgPricePerKg.toFixed(2)}</p>
                              <p className="text-[10px] text-purple-500">per kg (₹{avgPricePerQuintal.toFixed(0)}/quintal)</p>
                            </div>
                            <div className={`bg-gradient-to-br rounded-xl p-3 text-center border ${successRate >= 70 ? "from-emerald-50 to-emerald-100 border-emerald-200" :
                                successRate >= 40 ? "from-amber-50 to-amber-100 border-amber-200" :
                                  "from-red-50 to-red-100 border-red-200"
                              }`}>
                              <p className={`text-xs font-medium ${successRate >= 70 ? "text-emerald-600" : successRate >= 40 ? "text-amber-600" : "text-red-600"
                                }`}>Deal Success Rate</p>
                              <p className={`text-2xl font-bold ${successRate >= 70 ? "text-emerald-800" : successRate >= 40 ? "text-amber-800" : "text-red-800"
                                }`}>{successRate.toFixed(1)}%</p>
                              <p className={`text-[10px] ${successRate >= 70 ? "text-emerald-500" : successRate >= 40 ? "text-amber-500" : "text-red-500"
                                }`}>{acceptedDeals}/{totalDeals} deals accepted</p>
                            </div>
                            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-3 text-center border border-teal-200">
                              <p className="text-xs text-teal-600 font-medium">Per Quintal Revenue</p>
                              <p className="text-2xl font-bold text-teal-800">₹{totalQuintals > 0 ? (totalRevenue / totalQuintals).toFixed(0) : 0}</p>
                              <p className="text-[10px] text-teal-500">total revenue ÷ quintals</p>
                            </div>
                          </div>
                        </>
                      )
                    })()}

                    {/* Per-Crop Breakdown Table */}
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      Per-Crop Breakdown
                    </h3>
                    <div className="space-y-3">
                      {crops.map((crop: any) => {
                        const kgs = crop.quantity || 0
                        const quintals = kgs / 100
                        const expectedRevenue = kgs * (crop.expected_price || 0)
                        const pricePerQuintal = (crop.expected_price || 0) * 100
                        const marketPrice = getMarketPrice(crop.name)
                        const priceDiff = marketPrice ? marketPrice - (crop.expected_price || 0) : null
                        const priceDiffPercent = marketPrice && crop.expected_price ? ((priceDiff! / crop.expected_price) * 100) : null

                        return (
                          <div key={crop.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            {/* Crop Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🌾</span>
                                <span className="font-bold text-gray-800 capitalize">{crop.name}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${crop.status === "available" ? "bg-emerald-100 text-emerald-700" :
                                  crop.status === "sold" ? "bg-blue-100 text-blue-700" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>
                                  {crop.status?.toUpperCase()}
                                </span>
                              </div>
                              {crop.location && (
                                <span className="text-xs text-gray-400">📍 {crop.location}</span>
                              )}
                            </div>

                            {/* Crop Calculations Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100">
                              <div className="bg-white p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Quantity</p>
                                <p className="font-bold text-gray-800">{kgs.toLocaleString("en-IN")} kgs</p>
                                <p className="text-xs text-gray-500">= {quintals.toFixed(2)} quintals</p>
                              </div>
                              <div className="bg-white p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Your Price</p>
                                <p className="font-bold text-gray-800">₹{(crop.expected_price || 0).toLocaleString("en-IN")}/kg</p>
                                <p className="text-xs text-gray-500">= ₹{pricePerQuintal.toLocaleString("en-IN")}/quintal</p>
                              </div>
                              <div className="bg-white p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Expected Revenue</p>
                                <p className="font-bold text-amber-700">₹{expectedRevenue.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-gray-500">{kgs.toLocaleString("en-IN")} kgs × ₹{crop.expected_price}/kg</p>
                              </div>
                              <div className="bg-white p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Market Price</p>
                                {marketPrice ? (
                                  <>
                                    <p className="font-bold text-gray-800">₹{marketPrice.toLocaleString("en-IN")}</p>
                                    <div className="flex items-center gap-1">
                                      {priceDiff! > 0 ? (
                                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                      ) : priceDiff! < 0 ? (
                                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                                      ) : (
                                        <Minus className="w-3 h-3 text-gray-400" />
                                      )}
                                      <span className={`text-xs font-medium ${priceDiff! > 0 ? "text-emerald-600" :
                                        priceDiff! < 0 ? "text-red-600" : "text-gray-500"
                                        }`}>
                                        {priceDiff! > 0 ? "+" : ""}{priceDiffPercent?.toFixed(1)}%
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">Not available</p>
                                )}
                              </div>
                            </div>

                            {/* Revenue at market price */}
                            {marketPrice && (
                              <div className={`px-4 py-2 text-xs flex items-center justify-between ${priceDiff! >= 0 ? "bg-emerald-50" : "bg-red-50"
                                }`}>
                                <span className="text-gray-600">Revenue at market price:</span>
                                <span className={`font-bold ${priceDiff! >= 0 ? "text-emerald-700" : "text-red-700"
                                  }`}>
                                  ₹{(kgs * marketPrice).toLocaleString("en-IN")}
                                  {priceDiff! !== 0 && (
                                    <span className="ml-1">
                                      ({priceDiff! > 0 ? "+" : ""}₹{(kgs * priceDiff!).toLocaleString("en-IN")} {priceDiff! > 0 ? "more" : "less"})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs text-blue-700">
                        💡 <strong>100 kgs = 1 quintal</strong> • Expected Revenue = Quantity (kgs) × Price (per kg) • Avg Price = Total Revenue ÷ Total Kgs • Success Rate = Accepted Deals ÷ Total Deals × 100
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
