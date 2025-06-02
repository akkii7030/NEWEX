"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, List, Home, Lock, Edit, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"

interface User {
  name: string
  email: string
  isSubscribed: boolean
}

interface Listing {
  id: string
  type: "rental" | "resale"
  title: string
  location: string
  price: string
  status: string
  createdAt: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Mock listings data
    setListings([
      {
        id: "1",
        type: "rental",
        title: "Spacious 2BHK in Bandra",
        location: "Bandra West, Mumbai",
        price: "₹45,000/month",
        status: "Active",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        type: "resale",
        title: "Luxury 3BHK Apartment",
        location: "Powai, Mumbai",
        price: "₹1.2 Cr",
        status: "Pending",
        createdAt: "2024-01-10",
      },
    ])
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600">Manage your property listings and grow your real estate business.</p>
        </div>

        {/* Subscription Status */}
        {!user.isSubscribed && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Upgrade to Premium</h3>
                    <p className="text-sm text-orange-700">
                      Get unlimited access to all property details and contact information.
                    </p>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">Upgrade Now</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/add-rental")}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Add Rental Listing</CardTitle>
                  <CardDescription>List a property for rent</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/add-resale")}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Add Resale Listing</CardTitle>
                  <CardDescription>List a property for sale</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/my-listings")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <List className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">My Listings</CardTitle>
                  <CardDescription>View all your listings</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Listings</CardTitle>
                <CardDescription>Your latest property listings</CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push("/my-listings")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {!user.isSubscribed && <Lock className="h-4 w-4 text-gray-400" />}
                    <div>
                      <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                      <p className="text-sm text-gray-600">{listing.location}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={listing.type === "rental" ? "default" : "secondary"}>{listing.type}</Badge>
                        <Badge variant={listing.status === "Active" ? "default" : "secondary"}>{listing.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{listing.price}</p>
                      <p className="text-sm text-gray-600">{listing.createdAt}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
