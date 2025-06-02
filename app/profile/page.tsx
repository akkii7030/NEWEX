"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/navbar"

interface User {
  name: string
  email: string
  phone: string
  state: string
  district: string
  location: string
  latitude: string
  longitude: string
  reraNumber: string
  isSubscribed: boolean
  joinedDate: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser({
        ...parsedUser,
        phone: "7758085393",
        state: "MH",
        district: "Alibag",
        location: "B.H.A.D.Colony, Kandivali, Singh Agri Estate, Kandivali East, Mumbai, Maharashtra 400101, India",
        latitude: "19.2053248",
        longitude: "72.8662016",
        reraNumber: "MH123456",
        isSubscribed: true,
        joinedDate: "May 2025",
      })
    }
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600 text-sm mt-2">{user.location}</p>
                  </div>

                  <Badge className="bg-orange-600 text-white px-4 py-2">Premium Plan</Badge>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State</span>
                      <span className="font-medium">{user.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">District</span>
                      <span className="font-medium">{user.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined</span>
                      <span className="font-medium">{user.joinedDate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="profile"
                      className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                    >
                      Profile
                    </TabsTrigger>
                    <TabsTrigger
                      value="subscription"
                      className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                    >
                      Subscription
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Location</label>
                          <p className="mt-1 text-gray-900">{user.location}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">State</label>
                          <p className="mt-1 text-gray-900">{user.state}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Latitude</label>
                          <p className="mt-1 text-gray-900">{user.latitude}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Password</label>
                          <p className="mt-1 text-gray-900">123456</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Name</label>
                          <p className="mt-1 text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">District</label>
                          <p className="mt-1 text-gray-900">{user.district}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Phone</label>
                          <p className="mt-1 text-gray-900">{user.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Longitude</label>
                          <p className="mt-1 text-gray-900">{user.longitude}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">ConfirmPassword</label>
                          <p className="mt-1 text-gray-900">123456</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="subscription" className="mt-6">
                    <div className="text-center py-8">
                      <Badge className="bg-green-600 text-white px-6 py-3 text-lg mb-4">Active Premium Plan</Badge>
                      <p className="text-gray-600 mb-4">You have access to all premium features</p>
                      <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">Unlimited</div>
                          <div className="text-sm text-gray-600">Property Listings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">All Zones</div>
                          <div className="text-sm text-gray-600">Access Available</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">24/7</div>
                          <div className="text-sm text-gray-600">Support</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
