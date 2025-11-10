export interface Farmer {
  id: string
  name: string
  phone: string
  email?: string
  village: string
  district: string
  state: string
  landSize: number
  primaryCrops: string[]
  verified: boolean
  joinedAt: string
}

const farmerDB: Farmer[] = [
  {
    id: "farmer-001",
    name: "Ravi Kumar",
    phone: "+91 98765 43210",
    email: "ravi@farmer.com",
    village: "Mangalagiri",
    district: "Guntur",
    state: "Andhra Pradesh",
    landSize: 10,
    primaryCrops: ["Rice", "Cotton"],
    verified: true,
    joinedAt: new Date().toISOString(),
  },
  {
    id: "farmer-002",
    name: "Lakshmi Devi",
    phone: "+91 98123 45678",
    email: "lakshmi@farmer.com",
    village: "Hanamkonda",
    district: "Warangal",
    state: "Telangana",
    landSize: 8,
    primaryCrops: ["Wheat", "Maize"],
    verified: true,
    joinedAt: new Date().toISOString(),
  },
]

export const farmerDatabase = {
  getAll: () => farmerDB,

  getById: (id: string) => farmerDB.find((f) => f.id === id),

  getByPhone: (phone: string) => farmerDB.find((f) => f.phone === phone),

  add: (farmer: Omit<Farmer, "id" | "joinedAt">) => {
    const newFarmer: Farmer = {
      ...farmer,
      id: `farmer-${Date.now()}`,
      joinedAt: new Date().toISOString(),
    }
    farmerDB.push(newFarmer)
    return newFarmer
  },

  update: (id: string, updates: Partial<Farmer>) => {
    const index = farmerDB.findIndex((f) => f.id === id)
    if (index !== -1) {
      farmerDB[index] = { ...farmerDB[index], ...updates }
      return farmerDB[index]
    }
    return null
  },
}
