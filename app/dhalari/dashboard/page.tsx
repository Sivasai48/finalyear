"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Package, IndianRupee, Users, LogOut } from "lucide-react"

const revenueData = [
  { date: "Mon", revenue: 12000 },
  { date: "Tue", revenue: 19000 },
  { date: "Wed", revenue: 15000 },
  { date: "Thu", revenue: 22000 },
  { date: "Fri", revenue: 25000 },
  { date: "Sat", revenue: 20000 },
  { date: "Sun", revenue: 18000 },
]

export default function DhalariDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthContext()
  const { t } = useLanguage()

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
    }
  }, [user, router])

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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dhalari.pendingRequests")}</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-gray-600">+5 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dhalari.acceptedDeals")}</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dhalari.totalEarnings")}</CardTitle>
              <IndianRupee className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹12.5L</div>
              <p className="text-xs text-gray-600">{t("dhalari.thisMonth")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dhalari.avgDealValue")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹80K</div>
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
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
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

            <Card>
              <CardHeader>
                <CardTitle>{t("dhalari.profileStats")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("dhalari.rating")}</span>
                  <span className="font-semibold">4.8/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("dhalari.successRate")}</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("dhalari.verified")}</span>
                  <span className="font-semibold text-emerald-600">Yes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
