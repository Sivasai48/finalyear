"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/context/auth-context"
import { Sprout, TrendingUp, MessageSquare, Users, ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user) {
      if (user.type === "farmer") {
        router.push("/farmer/dashboard")
      } else {
        router.push("/dhalari/dashboard")
      }
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header/Navigation */}
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">AgriConnect</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/auth/farmer")}
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Farmer Login
            </Button>
            <Button onClick={() => router.push("/auth/dhalari")} className="bg-blue-600 hover:bg-blue-700 text-white">
              Dhalari Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">Connect Farmers with Markets</h1>
            <p className="text-xl text-gray-600">
              A modern platform connecting farmers directly with traders (Dhalaris) for better prices and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => router.push("/auth/farmer")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                I'm a Farmer <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/auth/dhalari")}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 gap-2"
              >
                I'm a Trader <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Better Prices</p>
                    <p className="text-sm text-gray-600">Direct market access</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Verified Traders</p>
                    <p className="text-sm text-gray-600">Trusted network</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">24/7 Support</p>
                    <p className="text-sm text-gray-600">AI chatbot assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Crop Predictions</h3>
            <p className="text-gray-600">
              AI-powered crop recommendations and yield predictions based on your soil and climate.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Prices</h3>
            <p className="text-gray-600">Real-time market data and price predictions to maximize your profits.</p>
          </div>
          <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Network</h3>
            <p className="text-gray-600">Connect directly with verified traders and build long-term partnerships.</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-12 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account as a farmer or trader" },
              { step: "2", title: "Complete Profile", desc: "Add your details and preferences" },
              { step: "3", title: "Connect", desc: "Find trading partners or market opportunities" },
              { step: "4", title: "Transact", desc: "Negotiate and conduct business safely" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Agricultural Business?</h2>
          <p className="text-emerald-100 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of farmers and traders already benefiting from direct market connections and better prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push("/auth/farmer")} className="gap-2">
              Start as Farmer <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 gap-2"
              onClick={() => router.push("/auth/dhalari")}
            >
              Start as Trader <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>AgriConnect © 2025. Connecting Farmers with Markets for Better Opportunities.</p>
        </div>
      </footer>
    </div>
  )
}
