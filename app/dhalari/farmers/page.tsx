"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, MapPin, Leaf, Phone, Search } from "lucide-react"

export default function FarmersDirectory() {
  const router = useRouter()
  const [farmers, setFarmers] = useState<any[]>([])
  const [filteredFarmers, setFilteredFarmers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFarmers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = farmers.filter(
        (farmer) =>
          farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.primaryCrops.some((crop: string) => crop.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredFarmers(filtered)
    } else {
      setFilteredFarmers(farmers)
    }
  }, [searchTerm, farmers])

  const fetchFarmers = async () => {
    try {
      const response = await fetch("/api/farmers/all")
      const data = await response.json()

      if (data.success) {
        setFarmers(data.data)
        setFilteredFarmers(data.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching farmers:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Registered Farmers</h1>
          <p className="text-gray-600">Browse and connect with farmers on the platform</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, location, or crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p>Loading farmers...</p>
        ) : filteredFarmers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No farmers found</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarmers.map((farmer) => (
              <Card key={farmer.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{farmer.name}</h3>
                    {farmer.verified && <Badge className="mt-1 bg-emerald-600 text-xs">Verified</Badge>}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {farmer.village}, {farmer.district}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    {farmer.landSize} acres
                  </p>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {farmer.phone}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Grows:</p>
                  <div className="flex flex-wrap gap-1">
                    {farmer.primaryCrops.map((crop: string) => (
                      <Badge key={crop} variant="outline" className="text-xs bg-emerald-50">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                  Contact Farmer
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
