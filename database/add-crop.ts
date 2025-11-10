export interface FarmerCrop {
  id: string
  farmerId: string
  farmerName: string
  farmerPhone: string
  cropType: string
  quantity: number
  pricePerKg: number
  location: string
  description: string
  imageUrl?: string
  status: "available" | "sold" | "reserved"
  createdAt: string
  updatedAt: string
}

// In-memory storage for farmer crops
const farmerCropsDB: FarmerCrop[] = [
  {
    id: "crop-001",
    farmerId: "farmer-001",
    farmerName: "Ravi Kumar",
    farmerPhone: "+91 98765 43210",
    cropType: "Rice",
    quantity: 5000,
    pricePerKg: 25,
    location: "Guntur, Andhra Pradesh",
    description: "Premium Basmati Rice, Grade A quality",
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "crop-002",
    farmerId: "farmer-002",
    farmerName: "Lakshmi Devi",
    farmerPhone: "+91 98123 45678",
    cropType: "Wheat",
    quantity: 3000,
    pricePerKg: 22,
    location: "Warangal, Telangana",
    description: "Organic wheat, no pesticides",
    status: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const farmerCropsDatabase = {
  getAll: () => farmerCropsDB,

  getById: (id: string) => farmerCropsDB.find((crop) => crop.id === id),

  getByFarmerId: (farmerId: string) => farmerCropsDB.filter((crop) => crop.farmerId === farmerId),

  add: (crop: Omit<FarmerCrop, "id" | "createdAt" | "updatedAt">) => {
    const newCrop: FarmerCrop = {
      ...crop,
      id: `crop-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    farmerCropsDB.push(newCrop)
    return newCrop
  },

  update: (id: string, updates: Partial<FarmerCrop>) => {
    const index = farmerCropsDB.findIndex((crop) => crop.id === id)
    if (index !== -1) {
      farmerCropsDB[index] = {
        ...farmerCropsDB[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      return farmerCropsDB[index]
    }
    return null
  },

  delete: (id: string) => {
    const index = farmerCropsDB.findIndex((crop) => crop.id === id)
    if (index !== -1) {
      const deleted = farmerCropsDB[index]
      farmerCropsDB.splice(index, 1)
      return deleted
    }
    return null
  },

  getStats: () => ({
    totalCrops: farmerCropsDB.length,
    availableCrops: farmerCropsDB.filter((c) => c.status === "available").length,
    totalQuantity: farmerCropsDB.reduce((sum, crop) => sum + crop.quantity, 0),
    averagePrice: farmerCropsDB.reduce((sum, crop) => sum + crop.pricePerKg, 0) / farmerCropsDB.length || 0,
  }),
}
