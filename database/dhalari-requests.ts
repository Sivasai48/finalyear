export interface DhalariRequest {
  id: string
  dhalariId: string
  dhalariName: string
  dhalariPhone: string
  cropRequired: string
  quantityRequired: number
  priceOffered: number
  location: string
  deliveryDate: string
  additionalNotes?: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
}

const dhalariRequestsDB: DhalariRequest[] = []

export const dhalariRequestsDatabase = {
  getAll: () => dhalariRequestsDB,

  getByStatus: (status: string) => dhalariRequestsDB.filter((r) => r.status === status),

  getById: (id: string) => dhalariRequestsDB.find((r) => r.id === id),

  add: (request: Omit<DhalariRequest, "id" | "createdAt">) => {
    const newRequest: DhalariRequest = {
      ...request,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    dhalariRequestsDB.push(newRequest)
    return newRequest
  },

  updateStatus: (id: string, status: "accepted" | "declined") => {
    const index = dhalariRequestsDB.findIndex((r) => r.id === id)
    if (index !== -1) {
      dhalariRequestsDB[index].status = status
      return dhalariRequestsDB[index]
    }
    return null
  },

  delete: (id: string) => {
    const index = dhalariRequestsDB.findIndex((r) => r.id === id)
    if (index !== -1) {
      return dhalariRequestsDB.splice(index, 1)[0]
    }
    return null
  },
}
