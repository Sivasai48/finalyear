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
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
      return
    }

    fetchEarnings()
  }, [user, router])

  const fetchEarnings = async () => {
    try {
      const response = await fetch(`/api/dhalari/earnings?dhalariId=${user?.id || "dhalari-001"}`)
      const data = await response.json()
      if (data.success) {
        setMonthlyEarnings(data.data.monthly)
        setTotalEarnings(data.data.total)
      }
    } catch (error) {
      console.error("[v0] Error fetching earnings:", error)
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
            <h1 className="text-2xl font-bold">Earnings Breakdown</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-8 h-8 text-emerald-600" />
              <span className="text-4xl font-bold text-emerald-600">
                {loading ? "..." : `₹${totalEarnings.toLocaleString()}`}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Total commission earned from all deals</p>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : monthlyEarnings.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No earnings yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyEarnings.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {item.month} {item.year}
                      </h3>
                      <IndianRupee className="w-5 h-5 text-amber-600" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Deals Completed:</span>
                        <span className="font-semibold">{item.deals}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Earnings:</span>
                        <span className="font-bold text-emerald-600">₹{item.earnings.toLocaleString()}</span>
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
