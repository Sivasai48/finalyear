export interface TraderRequest {
  id: string
  dhalariId: string
  dhalariName: string
  dhalariPhone: string
  cropId: string
  farmerId: string
  farmerName: string
  cropType: string
  requestedQuantity: number
  offeredPrice: number
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
  updatedAt: string
}

const traderRequestsDB: TraderRequest[] = [
  {
    id: "req-001",
    dhalariId: "dhalari-001",
    dhalariName: "Suresh Traders",
    dhalariPhone: "+91 98456 78901",
    cropId: "crop-001",
    farmerId: "farmer-001",
    farmerName: "Ravi Kumar",
    cropType: "Rice",
    requestedQuantity: 2000,
    offeredPrice: 26,
    message: "Interested in buying your rice. Can we negotiate?",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const traderRequestsDatabase = {
  getAll: () => traderRequestsDB,

  getById: (id: string) => traderRequestsDB.find((req) => req.id === id),

  getByFarmerId: (farmerId: string) => traderRequestsDB.filter((req) => req.farmerId === farmerId),

  getByDhalariId: (dhalariId: string) => traderRequestsDB.filter((req) => req.dhalariId === dhalariId),

  add: (request: Omit<TraderRequest, "id" | "createdAt" | "updatedAt">) => {
    const newRequest: TraderRequest = {
      ...request,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    traderRequestsDB.push(newRequest)
    return newRequest
  },

  update: (id: string, updates: Partial<TraderRequest>) => {
    const index = traderRequestsDB.findIndex((req) => req.id === id)
    if (index !== -1) {
      traderRequestsDB[index] = {
        ...traderRequestsDB[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      return traderRequestsDB[index]
    }
    return null
  },

  getStats: (farmerId?: string) => {
    const requests = farmerId ? traderRequestsDB.filter((r) => r.farmerId === farmerId) : traderRequestsDB

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      declined: requests.filter((r) => r.status === "declined").length,
    }
  },
}
