export interface DealRecord {
  id: string
  dhalariId: string
  farmerId: string
  cropType: string
  quantity: number
  pricePerKg: number
  totalValue: number
  commission: number
  earnings: number
  month: string
  year: number
  status: "completed" | "in-progress" | "cancelled"
  createdAt: string
}

const dealsDB: DealRecord[] = []

export const dhalariAnalyticsDatabase = {
  getAll: () => dealsDB,

  getByDhalariId: (dhalariId: string) => dealsDB.filter((deal) => deal.dhalariId === dhalariId),

  addDeal: (deal: Omit<DealRecord, "id" | "createdAt">) => {
    const newDeal: DealRecord = {
      ...deal,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    dealsDB.push(newDeal)
    return newDeal
  },

  getStats: (dhalariId: string) => {
    const deals = dealsDB.filter((d) => d.dhalariId === dhalariId && d.status === "completed")

    const totalDeals = deals.length
    const totalRevenue = deals.reduce((sum, deal) => sum + deal.totalValue, 0)
    const totalEarnings = deals.reduce((sum, deal) => sum + deal.earnings, 0)
    const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0

    return {
      totalDeals,
      totalRevenue,
      totalEarnings,
      avgDealSize,
      successRate: totalDeals > 0 ? 100 : 0,
    }
  },

  getMonthlyData: (dhalariId: string) => {
    const deals = dealsDB.filter((d) => d.dhalariId === dhalariId && d.status === "completed")
    const monthlyMap = new Map<string, { deals: number; revenue: number }>()

    deals.forEach((deal) => {
      const key = deal.month
      const existing = monthlyMap.get(key) || { deals: 0, revenue: 0 }
      monthlyMap.set(key, {
        deals: existing.deals + 1,
        revenue: existing.revenue + deal.totalValue,
      })
    })

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6)
  },

  getCropDistribution: (dhalariId: string) => {
    const deals = dealsDB.filter((d) => d.dhalariId === dhalariId && d.status === "completed")
    const cropMap = new Map<string, number>()

    deals.forEach((deal) => {
      cropMap.set(deal.cropType, (cropMap.get(deal.cropType) || 0) + 1)
    })

    const total = deals.length
    return Array.from(cropMap.entries()).map(([name, count]) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
  },
}
