"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, IndianRupee, TrendingUp } from "lucide-react"

interface MonthlyEarning {
  month: string
  year: number
  earnings: number
  deals: number
}

export default function EarningsBreakdown() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const [monthlyEarnings, setMonthlyEarnings] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalValue: 0,
    acceptedDeals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
      return
    }

    fetchAnalyticsData()
  }, [user, router])

  const fetchAnalyticsData = async () => {
    try {
      if (!user?.id) return
      
      // Fetch total analytics
      const analyticsRes = await fetch(`http://localhost:8000/api/dhalaris/${user.id}/analytics`)
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setStats({
          totalValue: analyticsData.total_value,
          acceptedDeals: analyticsData.accepted_requests
        })
      }

      // Fetch monthly performance
      const monthlyRes = await fetch(`http://localhost:8000/api/dhalaris/${user.id}/monthly-performance`)
      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json()
        setMonthlyEarnings(monthlyData.months || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">{t("dhalari.totalEarnings")} Breakdown</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">{t("dhalari.totalEarnings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-8 h-8 text-blue-600" />
              <span className="text-4xl font-bold text-blue-800">
                {loading ? "..." : `₹${(stats.totalValue / 1000).toFixed(1)}K`}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-2">Total amount spent on accepted crop deals</p>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Spending Summary</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : monthlyEarnings.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No spending history yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyEarnings.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-gray-100 italic">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {item.month_name} {item.year}
                      </h3>
                      <IndianRupee className="w-5 h-5 text-blue-500" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t("stats.deals")}:</span>
                        <span className="font-semibold">{item.deal_count}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-2">
                        <span className="text-gray-600">Spent:</span>
                        <span className="font-bold text-blue-700">₹{(item.total_value).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
