"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { NotificationsBell } from "@/components/notifications-bell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Leaf, Users, HelpCircle, LogOut } from "lucide-react"

const chartData = [
  { month: "Jan", yield: 4000, avg: 2400 },
  { month: "Feb", yield: 3000, avg: 1398 },
  { month: "Mar", yield: 2000, avg: 9800 },
  { month: "Apr", yield: 2780, avg: 3908 },
  { month: "May", yield: 1890, avg: 4800 },
  { month: "Jun", yield: 2390, avg: 3800 },
]

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthContext()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    activeCrops: 0,
    totalRequests: 0,
    avgPrice: 0,
    successRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== "farmer") {
      router.push("/")
      return
    }

    fetchStats()
  }, [user, router])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/farmer/stats?farmerId=${user?.id}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

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

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/farmer/my-crops")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("farmer.activeCrops")}</CardTitle>
              <Leaf className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.activeCrops}</div>
              <p className="text-xs text-gray-600">Currently listed</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/farmer/trader-requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("farmer.traderRequests")}</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalRequests}</div>
              <p className="text-xs text-gray-600">Pending offers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("farmer.avgPrice")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{loading ? "..." : stats.avgPrice}</div>
              <p className="text-xs text-gray-600">{t("farmer.perQuintal")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("farmer.successRate")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.successRate}%</div>
              <p className="text-xs text-gray-600">{t("farmer.transactions")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("farmer.yieldPerformance")}</CardTitle>
                <CardDescription>{t("farmer.yourYieldVsAverage")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="yield" fill="#10b981" />
                    <Bar dataKey="avg" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("farmer.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push("/farmer/add-crop")}
                >
                  {t("farmer.addMyCrop")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/farmer/crop-prediction")}
                >
                  {t("farmer.predictCrop")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/farmer/price-prediction")}
                >
                  {t("farmer.pricePredictions")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/farmer/dhalari-info")}
                >
                  {t("farmer.findTraders")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => router.push("/farmer/dealer-requests")}
                >
                  Dealer Requests
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/farmer/profile")}
                >
                  {t("common.myProfile")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("farmer.needHelp")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => router.push("/farmer/contact-help")}
                >
                  <HelpCircle className="w-4 h-4" />
                  {t("farmer.support")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
