"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { NotificationsBell } from "@/components/notifications-bell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Package, IndianRupee, Users, LogOut, HelpCircle } from "lucide-react"

export default function DhalariDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthContext()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalRevenue: 0,
    totalEarnings: 0,
    avgDealSize: 0,
    successRate: 0,
  })
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
      return
    }

    fetchStats()
  }, [user, router])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dhalari/analytics?dhalariId=${user?.id}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.data.stats)
        setMonthlyData(data.data.monthlyData)
      }
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AgriConnect - {t("dhalari.welcome").split(",")[0]}</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsBell userId={user?.id || "dhalari-001"} userType="dhalari" />
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
          <h1 className="text-3xl font-bold text-gray-900">{t("dhalari.welcome")}</h1>
          <p className="text-gray-600">{t("dhalari.subtitle")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/dhalari/requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Crops</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : "View"}</div>
              <p className="text-xs text-gray-600">Click to browse</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/dhalari/accepted-deals")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dhalari.acceptedDeals")}</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.totalDeals}</div>
              <p className="text-xs text-gray-600">Click to view details</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/dhalari/earnings")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dhalari.totalEarnings")}</CardTitle>
              <IndianRupee className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{loading ? "..." : (stats.totalEarnings / 1000).toFixed(1)}K</div>
              <p className="text-xs text-gray-600">Click for breakdown</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dhalari.avgDealValue")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{loading ? "..." : (stats.avgDealSize / 1000).toFixed(0)}K</div>
              <p className="text-xs text-gray-600">{t("dhalari.perTransaction")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dhalari.weeklyEarnings")}</CardTitle>
                <CardDescription>{t("dhalari.yourEarningsThisWeek")}</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No deals yet. Accept deals to see your earnings!
                  </div>
                )}
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push("/dhalari/requests")}
                >
                  {t("dhalari.viewRequests")}
                </Button>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push("/dhalari/send-request")}
                >
                  Send Crop Request
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/dhalari/profile")}
                >
                  {t("dhalari.myProfile")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/dhalari/analytics")}
                >
                  {t("dhalari.analytics")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-amber-600" />
                <CardTitle className="text-amber-900">Query Support & Help</CardTitle>
              </div>
              <CardDescription className="text-amber-700">
                Need assistance? Get help with platform features and resolve your queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => router.push("/dhalari/query-support")}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Open Query Support Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
