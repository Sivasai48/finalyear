// Mock database utilities for development
// In production, replace with actual database (MongoDB, PostgreSQL, etc.)

export const mockDB = {
  users: new Map(),
  crops: new Map(),
  prices: new Map(),
  requests: new Map(),

  // Initialize with seed data
  init() {
    // Seed users
    this.users.set("farmer1", {
      id: "farmer1",
      type: "farmer",
      phone: "919876543210",
      name: "Rajesh Kumar",
      verified: true,
    })

    this.users.set("dhalari1", {
      id: "dhalari1",
      type: "dhalari",
      email: "sharma@trading.com",
      name: "Sharma Trading",
      verified: true,
    })
  },

  // Generic CRUD operations
  create(collection: keyof typeof mockDB, id: string, data: any) {
    this[collection].set(id, { ...data, id, createdAt: new Date() })
    return data
  },

  read(collection: keyof typeof mockDB, id: string) {
    return this[collection].get(id)
  },

  update(collection: keyof typeof mockDB, id: string, data: any) {
    const existing = this[collection].get(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updatedAt: new Date() }
    this[collection].set(id, updated)
    return updated
  },

  delete(collection: keyof typeof mockDB, id: string) {
    return this[collection].delete(id)
  },

  list(collection: keyof typeof mockDB) {
    return Array.from(this[collection].values())
  },
}

mockDB.init()
