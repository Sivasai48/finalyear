// Comprehensive database system for AgriConnect platform
// This uses in-memory storage with structured data models

export interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  crops: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Dhalari {
  id: string
  name: string
  email: string
  phone: string
  businessName: string
  specialization: string[]
  location: string
  rating: number
  commissionRate: number
  experience: number
  totalDeals: number
  createdAt: Date
  updatedAt: Date
}

export interface Crop {
  id: string
  farmerId: string
  farmerName: string
  farmerEmail: string
  farmerPhone: string
  cropName: string
  quantity: number
  pricePerKg: number
  location: string
  description: string
  status: "available" | "sold" | "reserved"
  createdAt: Date
  updatedAt: Date
}

export interface CropPrediction {
  id: string
  farmerId: string
  cropName: string
  soilType: string
  landSize: number
  irrigationType: string
  region: string
  predictedYield: number
  successProbability: number
  bestPractices: string[]
  createdAt: Date
}

export interface PricePrediction {
  id: string
  farmerId: string
  cropName: string
  month: string
  currentPrice: number
  predictedPrice: number
  priceChange: number
  recommendation: string
  confidence: number
  createdAt: Date
}

export interface TraderRequest {
  id: string
  dhalariId: string
  dhalariName: string
  dhalariPhone: string
  cropId: string
  farmerId: string
  cropName: string
  requestedQuantity: number
  offeredPrice: number
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt: Date
  updatedAt: Date
}

// In-memory storage
class Database {
  private farmers: Map<string, Farmer> = new Map()
  private dhalaris: Map<string, Dhalari> = new Map()
  private crops: Map<string, Crop> = new Map()
  private cropPredictions: Map<string, CropPrediction> = new Map()
  private pricePredictions: Map<string, PricePrediction> = new Map()
  private traderRequests: Map<string, TraderRequest> = new Map()

  constructor() {
    this.seedData()
  }

  private seedData() {
    // Seed farmers
    const seedFarmers: Farmer[] = [
      {
        id: "farmer-1",
        name: "Raj Kumar",
        email: "raj@farmer.com",
        phone: "+91 98765 43210",
        location: "Punjab",
        crops: ["Wheat", "Rice"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "farmer-2",
        name: "Priya Singh",
        email: "priya@farmer.com",
        phone: "+91 98765 43211",
        location: "Haryana",
        crops: ["Rice", "Cotton"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    seedFarmers.forEach((f) => this.farmers.set(f.id, f))

    // Seed dhalaris
    const seedDhalaris: Dhalari[] = [
      {
        id: "dhalari-1",
        name: "Ramesh Trading Co.",
        email: "ramesh@trader.com",
        phone: "+91 98765 43220",
        businessName: "Ramesh Agro Traders",
        specialization: ["Wheat", "Rice"],
        location: "Punjab",
        rating: 4.5,
        commissionRate: 3,
        experience: 15,
        totalDeals: 250,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dhalari-2",
        name: "Sunita Exports",
        email: "sunita@trader.com",
        phone: "+91 98765 43221",
        businessName: "Sunita Agro Exports",
        specialization: ["Cotton", "Sugarcane"],
        location: "Gujarat",
        rating: 4.8,
        commissionRate: 2.5,
        experience: 20,
        totalDeals: 400,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    seedDhalaris.forEach((d) => this.dhalaris.set(d.id, d))

    // Seed crops
    const seedCrops: Crop[] = [
      {
        id: "crop-1",
        farmerId: "farmer-1",
        farmerName: "Raj Kumar",
        farmerEmail: "raj@farmer.com",
        farmerPhone: "+91 98765 43210",
        cropName: "Wheat",
        quantity: 5000,
        pricePerKg: 25,
        location: "Punjab",
        description: "High quality wheat, ready for harvest",
        status: "available",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    seedCrops.forEach((c) => this.crops.set(c.id, c))
  }

  // Farmer methods
  addFarmer(farmer: Omit<Farmer, "createdAt" | "updatedAt">): Farmer {
    const newFarmer = { ...farmer, createdAt: new Date(), updatedAt: new Date() }
    this.farmers.set(farmer.id, newFarmer)
    return newFarmer
  }

  getFarmer(id: string): Farmer | undefined {
    return this.farmers.get(id)
  }

  getAllFarmers(): Farmer[] {
    return Array.from(this.farmers.values())
  }

  // Dhalari methods
  addDhalari(dhalari: Omit<Dhalari, "createdAt" | "updatedAt">): Dhalari {
    const newDhalari = { ...dhalari, createdAt: new Date(), updatedAt: new Date() }
    this.dhalaris.set(dhalari.id, newDhalari)
    return newDhalari
  }

  getDhalari(id: string): Dhalari | undefined {
    return this.dhalaris.get(id)
  }

  getAllDhalaris(): Dhalari[] {
    return Array.from(this.dhalaris.values())
  }

  updateDhalari(id: string, updates: Partial<Dhalari>): Dhalari | undefined {
    const dhalari = this.dhalaris.get(id)
    if (!dhalari) return undefined
    const updated = { ...dhalari, ...updates, updatedAt: new Date() }
    this.dhalaris.set(id, updated)
    return updated
  }

  // Crop methods
  addCrop(crop: Omit<Crop, "id" | "createdAt" | "updatedAt">): Crop {
    const id = `crop-${Date.now()}`
    const newCrop = { ...crop, id, status: "available" as const, createdAt: new Date(), updatedAt: new Date() }
    this.crops.set(id, newCrop)
    return newCrop
  }

  getCrop(id: string): Crop | undefined {
    return this.crops.get(id)
  }

  getCropsByFarmer(farmerId: string): Crop[] {
    return Array.from(this.crops.values()).filter((c) => c.farmerId === farmerId)
  }

  getAllCrops(): Crop[] {
    return Array.from(this.crops.values())
  }

  getAvailableCrops(): Crop[] {
    return Array.from(this.crops.values()).filter((c) => c.status === "available")
  }

  updateCrop(id: string, updates: Partial<Crop>): Crop | undefined {
    const crop = this.crops.get(id)
    if (!crop) return undefined
    const updated = { ...crop, ...updates, updatedAt: new Date() }
    this.crops.set(id, updated)
    return updated
  }

  deleteCrop(id: string): boolean {
    return this.crops.delete(id)
  }

  // Crop Prediction methods
  addCropPrediction(prediction: Omit<CropPrediction, "id" | "createdAt">): CropPrediction {
    const id = `pred-${Date.now()}`
    const newPrediction = { ...prediction, id, createdAt: new Date() }
    this.cropPredictions.set(id, newPrediction)
    return newPrediction
  }

  getCropPredictionsByFarmer(farmerId: string): CropPrediction[] {
    return Array.from(this.cropPredictions.values()).filter((p) => p.farmerId === farmerId)
  }

  // Price Prediction methods
  addPricePrediction(prediction: Omit<PricePrediction, "id" | "createdAt">): PricePrediction {
    const id = `price-${Date.now()}`
    const newPrediction = { ...prediction, id, createdAt: new Date() }
    this.pricePredictions.set(id, newPrediction)
    return newPrediction
  }

  getPricePredictionsByFarmer(farmerId: string): PricePrediction[] {
    return Array.from(this.pricePredictions.values()).filter((p) => p.farmerId === farmerId)
  }

  // Trader Request methods
  addTraderRequest(request: Omit<TraderRequest, "id" | "createdAt" | "updatedAt">): TraderRequest {
    const id = `req-${Date.now()}`
    const newRequest = { ...request, id, status: "pending" as const, createdAt: new Date(), updatedAt: new Date() }
    this.traderRequests.set(id, newRequest)
    return newRequest
  }

  getTraderRequestsByFarmer(farmerId: string): TraderRequest[] {
    return Array.from(this.traderRequests.values()).filter((r) => r.farmerId === farmerId)
  }

  getTraderRequestsByDhalari(dhalariId: string): TraderRequest[] {
    return Array.from(this.traderRequests.values()).filter((r) => r.dhalariId === dhalariId)
  }

  updateTraderRequest(id: string, updates: Partial<TraderRequest>): TraderRequest | undefined {
    const request = this.traderRequests.get(id)
    if (!request) return undefined
    const updated = { ...request, ...updates, updatedAt: new Date() }
    this.traderRequests.set(id, updated)
    return updated
  }

  // Statistics methods
  getFarmerStats(farmerId: string) {
    const crops = this.getCropsByFarmer(farmerId)
    const requests = this.getTraderRequestsByFarmer(farmerId)
    const predictions = this.getCropPredictionsByFarmer(farmerId)

    const activeCrops = crops.filter((c) => c.status === "available").length
    const totalRequests = requests.length
    const pendingRequests = requests.filter((r) => r.status === "pending").length
    const acceptedRequests = requests.filter((r) => r.status === "accepted").length

    const avgPrice = crops.length > 0 ? crops.reduce((sum, c) => sum + c.pricePerKg, 0) / crops.length : 0

    const successRate = totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0

    return {
      activeCrops,
      totalRequests,
      pendingRequests,
      avgPrice: Math.round(avgPrice),
      successRate,
      totalPredictions: predictions.length,
    }
  }

  getDhalariStats(dhalariId: string) {
    const dhalari = this.getDhalari(dhalariId)
    const requests = this.getTraderRequestsByDhalari(dhalariId)

    const pendingRequests = requests.filter((r) => r.status === "pending").length
    const acceptedRequests = requests.filter((r) => r.status === "accepted").length
    const totalRevenue = acceptedRequests * 50000 // Estimated revenue

    return {
      pendingRequests,
      acceptedDeals: acceptedRequests,
      totalRevenue,
      successRate: dhalari?.totalDeals || 0,
      rating: dhalari?.rating || 0,
    }
  }
}

// Export singleton instance
export const db = new Database()
