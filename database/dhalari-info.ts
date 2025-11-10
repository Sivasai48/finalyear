export interface Dhalari {
  id: string
  name: string
  businessName: string
  phone: string
  email: string
  specialization: string[]
  location: string
  rating: number
  totalDeals: number
  commissionRate: number
  verified: boolean
  experience: number
  imageUrl?: string
  createdAt: string
}

const dhalariDB: Dhalari[] = [
  {
    id: "dhalari-001",
    name: "Suresh Reddy",
    businessName: "Suresh Traders",
    phone: "+91 98456 78901",
    email: "suresh@traders.com",
    specialization: ["Rice", "Wheat", "Cotton"],
    location: "Guntur, Andhra Pradesh",
    rating: 4.5,
    totalDeals: 150,
    commissionRate: 5,
    verified: true,
    experience: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: "dhalari-002",
    name: "Venkat Rao",
    businessName: "Venkat Grain Trading",
    phone: "+91 98123 56789",
    email: "venkat@graintrading.com",
    specialization: ["Rice", "Maize", "Pulses"],
    location: "Warangal, Telangana",
    rating: 4.7,
    totalDeals: 200,
    commissionRate: 4,
    verified: true,
    experience: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "dhalari-003",
    name: "Ramesh Kumar",
    businessName: "Ramesh Agricultural Products",
    phone: "+91 99887 65432",
    email: "ramesh@agriproducts.com",
    specialization: ["Cotton", "Sugarcane", "Groundnut"],
    location: "Kurnool, Andhra Pradesh",
    rating: 4.3,
    totalDeals: 120,
    commissionRate: 6,
    verified: true,
    experience: 8,
    createdAt: new Date().toISOString(),
  },
]

export const dhalariDatabase = {
  getAll: () => dhalariDB,

  getById: (id: string) => dhalariDB.find((d) => d.id === id),

  search: (filters: {
    specialization?: string
    location?: string
    minRating?: number
  }) => {
    return dhalariDB.filter((dhalari) => {
      if (filters.specialization && !dhalari.specialization.includes(filters.specialization)) {
        return false
      }
      if (filters.location && !dhalari.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
      if (filters.minRating && dhalari.rating < filters.minRating) {
        return false
      }
      return true
    })
  },

  add: (dhalari: Omit<Dhalari, "id" | "createdAt">) => {
    const newDhalari: Dhalari = {
      ...dhalari,
      id: `dhalari-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    dhalariDB.push(newDhalari)
    return newDhalari
  },

  update: (id: string, updates: Partial<Dhalari>) => {
    const index = dhalariDB.findIndex((d) => d.id === id)
    if (index !== -1) {
      dhalariDB[index] = { ...dhalariDB[index], ...updates }
      return dhalariDB[index]
    }
    return null
  },

  delete: (id: string) => {
    const index = dhalariDB.findIndex((d) => d.id === id)
    if (index !== -1) {
      const deleted = dhalariDB[index]
      dhalariDB.splice(index, 1)
      return deleted
    }
    return null
  },
}
