"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { NotificationsBell } from "@/components/notifications-bell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Package, IndianRupee, Users, LogOut, HelpCircle } from "lucide-react"

export default function DhalariDashboard() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuthContext()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalDeals: 0,
    acceptedDeals: 0,
    totalRevenue: 0,
    totalEarnings: 0,
    avgDealSize: 0,
    successRate: 0,
  })
  const [marketStats, setMarketStats] = useState({
    active_farmers: 0,
    new_listings_today: 0,
    total_listings: 0,
    top_crop: "N/A",
    top_crop_count: 0,
    market_trend: "Stable",
    total_trade_value_today: 0,
  })
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      if (!user?.id) return

      // Fetch market-wide statistics
      const marketResponse = await fetch(`http://127.0.0.1:8000/api/dhalaris/market-stats`)
      if (marketResponse.ok) {
        const marketData = await marketResponse.json()
        setMarketStats(marketData)
      }

      // Fetch personal analytics
      const analyticsResponse = await fetch(`http://127.0.0.1:8000/api/dhalaris/${user.id}/analytics`)
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        const successRate = analyticsData.total_requests > 0 
          ? (analyticsData.accepted_requests / analyticsData.total_requests) * 100 
          : 0

        setStats({
          totalDeals: analyticsData.total_requests,
          acceptedDeals: analyticsData.accepted_requests,
          totalRevenue: analyticsData.total_value,
          totalEarnings: analyticsData.total_value, // For Dhalari, this is "Amount Spent"
          avgDealSize: analyticsData.accepted_requests > 0 
            ? analyticsData.total_value / analyticsData.accepted_requests 
            : 0,
          successRate: successRate,
        })
      }

      // Fetch monthly performance
      const monthlyResponse = await fetch(`http://127.0.0.1:8000/api/dhalaris/${user.id}/monthly-performance`)
      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json()
        setMonthlyPerformance(monthlyData.months || [])
      }

    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && user && user.type === "dhalari") {
      fetchStats()
      const interval = setInterval(fetchStats, 10000)
      return () => clearInterval(interval)
    }
  }, [user, isLoading])

  // Show loading while auth context is hydrating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // NO REDIRECT - just show login prompt if not authenticated
  if (!user || user.type !== "dhalari") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t("dashboard.dhalariDashboard")}</CardTitle>
            <CardDescription>{t("dashboard.pleaseSignIn")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/dhalari/auth")}
            >
              {t("dashboard.signInGoogle")}
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
    // Force full page reload to clear any remaining state/cache
    window.location.href = "/"
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
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            onClick={() => router.push("/dhalari/market")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">{t("dashboard.availableCrops")}</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{loading ? "..." : t("dashboard.view")}</div>
              <p className="text-xs text-blue-600">{t("dashboard.clickBrowse")}</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
            onClick={() => router.push("/dhalari/accepted-deals")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">{t("dhalari.acceptedDeals")}</CardTitle>
              <Users className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{loading ? "..." : stats.acceptedDeals}</div>
              <p className="text-xs text-emerald-600">{t("dashboard.activePartnerships")}</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
            onClick={() => router.push("/dhalari/earnings")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">{t("dhalari.totalEarnings")}</CardTitle>
              <IndianRupee className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800">₹{loading ? "..." : (stats.totalEarnings / 1000).toFixed(1)}K</div>
              <p className="text-xs text-amber-600">{t("dashboard.commissionEarned")}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">{t("dhalari.avgDealValue")}</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">₹{loading ? "..." : (stats.avgDealSize / 1000).toFixed(0)}K</div>
              <p className="text-xs text-purple-600">{t("dhalari.perTransaction")}</p>
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
                    {loading ? "..." : `${stats.successRate.toFixed(0)}%`}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${stats.successRate >= 70 ? "bg-emerald-100 text-emerald-700" :
                    stats.successRate >= 40 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                    {stats.successRate >= 70 ? t("stats.excellent") : stats.successRate >= 40 ? t("stats.good") : t("stats.needsImprovement")}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${stats.successRate >= 70 ? "bg-emerald-500" :
                      stats.successRate >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                    style={{ width: `${Math.min(stats.successRate, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.acceptedDeals} {t("stats.acceptedOutOf")} {stats.totalDeals} {t("stats.totalRequests")}
                </p>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.revenueBreakdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.totalTradeValue")}</span>
                    <span className="font-bold text-gray-800">₹{(stats.totalRevenue / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("dhalari.acceptedDeals")}</span>
                    <span className="font-bold text-emerald-600">{stats.acceptedDeals}</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.avgPerDeal")}</span>
                    <span className="font-bold text-blue-600">₹{(stats.avgDealSize / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.todaysMarket")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.marketTrend")}</span>
                    <span className={`flex items-center gap-1 ${marketStats.market_trend === 'Bullish' ? 'text-emerald-600' :
                      marketStats.market_trend === 'Bearish' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                      {marketStats.market_trend === 'Bullish' ? <TrendingUp className="w-4 h-4" /> :
                        marketStats.market_trend === 'Bearish' ? <TrendingDown className="w-4 h-4" /> :
                          <Minus className="w-4 h-4" />}
                      <span className="font-bold">{loading ? '...' : marketStats.market_trend}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.activeFarmers")}</span>
                    <span className="font-bold text-gray-800">{loading ? '...' : marketStats.active_farmers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.newListingsToday")}</span>
                    <span className="font-bold text-blue-600">{loading ? '...' : marketStats.new_listings_today}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("stats.topCrop")}</span>
                    <span className="font-bold text-amber-600">
                      {loading ? '...' : `${marketStats.top_crop} 🌾`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm text-gray-600">{t("stats.totalListings")}</span>
                    <span className="font-bold text-purple-600">{loading ? '...' : marketStats.total_listings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Monthly Performance Trends */}
        <div className="mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t("stats.monthlyPerformance")}
              </CardTitle>
              <CardDescription>{t("stats.tradingPerformance")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-6 gap-4">
                {monthlyPerformance.length > 0 ? (
                  monthlyPerformance.map((monthData, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{monthData.month_name} {monthData.year}</p>
                      <p className="text-lg font-bold text-gray-800">{monthData.deal_count}</p>
                      <p className="text-xs text-gray-600">{t("stats.deals")}</p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        ₹{(monthData.total_value / 1000).toFixed(0)}K
                      </p>
                    </div>
                  ))
                ) : (
                  // Fallback for no data
                  [1, 2, 3, 4, 5, 6].map((_, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">--</p>
                      <p className="text-lg font-bold text-gray-800">0</p>
                      <p className="text-xs text-gray-600">{t("stats.deals")}</p>
                      <p className="text-sm font-semibold text-emerald-600 mt-1">₹0K</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Support Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("farmer.quickActions")}</CardTitle>
              <CardDescription>{t("actions.manageTrading")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-lg"
                onClick={() => router.push("/dhalari/requests")}
              >
                {t("dhalari.viewRequests")}
              </Button>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 h-10 text-lg"
                onClick={() => router.push("/dhalari/contact-requests")}
              >
                {t("actions.contactRequests")}
              </Button>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 text-lg"
                onClick={() => router.push("/dhalari/market")}
              >
                {t("actions.browseMarketplace")}
              </Button>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 h-10 text-lg"
                onClick={() => router.push("/dhalari/connections")}
              >
                {t("actions.connectionsChat")}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/dhalari/farmers")}
                >
                  {t("actions.findFarmers")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/dhalari/profile")}
                >
                  {t("dhalari.myProfile")}
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="h-full border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-amber-600" />
                <CardTitle className="text-amber-900">{t("support.querySupport")}</CardTitle>
              </div>
              <CardDescription className="text-amber-700">
                {t("support.needAssistance")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-end h-full pt-0">
              <div className="bg-white/60 p-4 rounded-lg mb-4 text-sm text-amber-800">
                <p className="mb-2"><strong>{t("support.commonTopics")}</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{t("support.paymentDisputes")}</li>
                  <li>{t("support.profileVerification")}</li>
                  <li>{t("support.marketplaceGuidelines")}</li>
                </ul>
              </div>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white h-10 text-lg"
                onClick={() => router.push("/dhalari/query-support")}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {t("support.openSupportCenter")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
