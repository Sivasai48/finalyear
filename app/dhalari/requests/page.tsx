"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Leaf, Phone } from "lucide-react"
import { requestsDatabase } from "@/database/requests"

export default function DhalariRequests() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (!user || user.type !== "dhalari") {
      router.push("/")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Farmer Requests</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {requestsDatabase.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{request.farmerName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm font-semibold text-emerald-600">
                      <Phone className="w-4 h-4" />
                      {request.farmerPhone}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        {request.crop} - {request.quantity}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {request.location}
                      </div>
                      <div className="font-semibold text-gray-900">{request.expectedPrice}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.status === "pending" ? (
                      <>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Accept</Button>
                        <Button variant="outline">Decline</Button>
                      </>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
                        Accepted
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
