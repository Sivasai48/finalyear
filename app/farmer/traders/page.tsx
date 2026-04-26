"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, MapPin, Phone, Star, Search, Briefcase } from "lucide-react"
import { ProfileDialog } from "@/components/profile-dialog"

export default function TradersDirectory() {
  const router = useRouter()
  const [traders, setTraders] = useState<any[]>([])
  const [filteredTraders, setFilteredTraders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewProfileUser, setViewProfileUser] = useState<any>(null)

  useEffect(() => {
    fetchTraders()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = traders.filter(
        (trader) =>
          trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trader.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trader.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trader.specialization.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredTraders(filtered)
    } else {
      setFilteredTraders(traders)
    }
  }, [searchTerm, traders])

  const fetchTraders = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/dhalaris")
      // Using 127.0.0.1 for reliable local connection

      let data
      if (response.ok) {
        data = await response.json()
        setTraders(data)
        setFilteredTraders(data)
      } else {
        // Fallback to old path if that was working? No, stick to new standard.
        console.error("Failed to fetch traders")
      }

    } catch (error) {
      console.error("[v0] Error fetching traders:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Registered Traders</h1>
          <p className="text-gray-600">Browse and connect with verified traders</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, business, location, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p>Loading traders...</p>
        ) : filteredTraders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No traders found</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTraders.map((trader) => (
              <Card key={trader.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200"
                    onClick={() => setViewProfileUser(trader)}
                  >
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3
                      className="font-bold text-lg cursor-pointer hover:underline"
                      onClick={() => setViewProfileUser(trader)}
                    >
                      {trader.name}
                    </h3>
                    {trader.verified && <Badge className="mt-1 bg-blue-600 text-xs">Verified</Badge>}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    {trader.businessName}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {trader.location}
                  </p>
                  <p className="text-sm font-bold text-blue-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {trader.phone}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{trader.rating}</span>
                    <span className="text-xs text-gray-500">({trader.totalDeals} deals)</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Specializes in:</p>
                  <div className="flex flex-wrap gap-1">
                    {trader.specialization && trader.specialization.map((spec: string) => (
                      <Badge key={spec} variant="outline" className="text-xs bg-blue-50">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  <p>Commission: {trader.commissionRate}%</p>
                  <p>Experience: {trader.experience} years</p>
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="sm">
                  Contact Trader
                </Button>
              </Card>
            ))}
          </div>
        )}

        <ProfileDialog
          open={!!viewProfileUser}
          onOpenChange={(open) => !open && setViewProfileUser(null)}
          user={viewProfileUser}
          type="dhalari"
        />
      </div>
    </div>
  )
}
