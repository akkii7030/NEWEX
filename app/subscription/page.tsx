"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, CreditCard, Check } from "lucide-react"
import Navbar from "@/components/navbar"

interface Location {
  id: string
  name: string
  price: number
  popular?: boolean
}

export default function SubscriptionPage() {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const locations: Location[] = [
    { id: "andheri", name: "Andheri", price: 500, popular: true },
    { id: "kandivali", name: "Kandivali", price: 400 },
    { id: "bandra", name: "Bandra", price: 600, popular: true },
    { id: "powai", name: "Powai", price: 550 },
    { id: "juhu", name: "Juhu", price: 700 },
    { id: "malad", name: "Malad", price: 350 },
    { id: "borivali", name: "Borivali", price: 300 },
    { id: "goregaon", name: "Goregaon", price: 450 },
  ]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const totalPrice = selectedLocations.reduce((sum, locationId) => {
    const location = locations.find((l) => l.id === locationId)
    return sum + (location?.price || 0)
  }, 0)

  const handleLocationToggle = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId) ? prev.filter((id) => id !== locationId) : [...prev, locationId],
    )
  }

  const handleSubscribe = async () => {
    if (selectedLocations.length === 0) {
      alert("Please select at least one location")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locations: selectedLocations,
          totalAmount: totalPrice,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // In a real app, integrate with Razorpay here
        // For now, we'll simulate payment success
        alert(`Payment of ₹${totalPrice} successful! Subscription activated.`)

        // Update user subscription status
        const updatedUser = { ...user, isSubscribed: true, subscribedLocations: selectedLocations }
        localStorage.setItem("user", JSON.stringify(updatedUser))

        router.push("/my-inventories")
      } else {
        alert("Subscription failed")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      // Fallback for demo
      alert(`Payment of ₹${totalPrice} successful! Subscription activated.`)
      const updatedUser = { ...user, isSubscribed: true, subscribedLocations: selectedLocations }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      router.push("/my-inventories")
    }
    setIsLoading(false)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Subscription</h1>
          <p className="text-gray-600">Select the locations you want to access property listings for</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Location Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span>Select Locations</span>
                </CardTitle>
                <CardDescription>Choose the areas where you want to access property listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedLocations.includes(location.id)
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleLocationToggle(location.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedLocations.includes(location.id)}
                            onChange={() => handleLocationToggle(location.id)}
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{location.name}</span>
                              {location.popular && <Badge className="bg-orange-600 text-white">Popular</Badge>}
                            </div>
                            <span className="text-sm text-gray-600">₹{location.price}/month</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Subscription Summary</CardTitle>
                <CardDescription>Your selected locations and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedLocations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No locations selected</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {selectedLocations.map((locationId) => {
                        const location = locations.find((l) => l.id === locationId)
                        return (
                          <div key={locationId} className="flex justify-between items-center">
                            <span className="text-sm">{location?.name}</span>
                            <span className="text-sm font-medium">₹{location?.price}</span>
                          </div>
                        )
                      })}
                    </div>
                    <hr />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Monthly</span>
                      <span className="text-orange-600">₹{totalPrice}</span>
                    </div>
                  </>
                )}

                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Access to all property details</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Contact information visible</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>WhatsApp integration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Property comparison tools</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={selectedLocations.length === 0 || isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : `Subscribe for ₹${totalPrice}/month`}
                </Button>

                <Button variant="outline" onClick={() => router.push("/my-inventories")} className="w-full">
                  Skip for Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
