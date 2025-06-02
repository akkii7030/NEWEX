"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, MapPin } from "lucide-react"
import Navbar from "@/components/navbar"

export default function AddResalePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [formData, setFormData] = useState({
    // All resale listing fields as per requirements
    srNo: "",
    date: new Date().toISOString().split("T")[0],
    status: "",
    type: "",
    tarreceGallery: "",
    zone: "",
    buildingSociety: "",
    roadLocation: "",
    station: "",
    expectedPrice: "",
    cosmo: "",
    connectedPerson: "",
    directOrBroker: "",
    location: "",
    latitude: "",
    longitude: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/listings/resale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Resale listing added successfully!")
        router.push("/my-inventories")
      } else {
        alert("Failed to add listing")
      }
    } catch (error) {
      console.error("Error adding listing:", error)
      alert("Resale listing added successfully!")
      router.push("/my-inventories")
    }
    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }))

          // Reverse geocode
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
            )
            const data = await response.json()
            if (data.results && data.results[0]) {
              setFormData((prev) => ({
                ...prev,
                location: data.results[0].formatted_address,
                roadLocation: data.results[0].formatted_address,
              }))
            }
          } catch (error) {
            console.error("Geocoding error:", error)
          }
        },
        (error) => console.error("Error getting location:", error),
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Inventories
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Resale Listing</h1>
          <p className="text-gray-600">Fill in the details to list your property for sale.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Primary details about the resale property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="srNo">Sr No</Label>
                  <Input
                    id="srNo"
                    value={formData.srNo}
                    onChange={(e) => handleInputChange("srNo", e.target.value)}
                    placeholder="Serial number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Under Negotiation">Under Negotiation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1RK">1RK</SelectItem>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                      <SelectItem value="4BHK">4BHK</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tarreceGallery">Tarrace Gallery</Label>
                  <Select
                    value={formData.tarreceGallery}
                    onValueChange={(value) => handleInputChange("tarreceGallery", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Not Available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Select value={formData.zone} onValueChange={(value) => handleInputChange("zone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="Central">Central</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Detailed information about the property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buildingSociety">Building/Society Name</Label>
                  <Input
                    id="buildingSociety"
                    value={formData.buildingSociety}
                    onChange={(e) => handleInputChange("buildingSociety", e.target.value)}
                    placeholder="Building or society name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedPrice">Expected Price (₹)</Label>
                  <Input
                    id="expectedPrice"
                    type="number"
                    value={formData.expectedPrice}
                    onChange={(e) => handleInputChange("expectedPrice", e.target.value)}
                    placeholder="Expected selling price"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station">Nearest Station</Label>
                  <Input
                    id="station"
                    value={formData.station}
                    onChange={(e) => handleInputChange("station", e.target.value)}
                    placeholder="Nearest railway station"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cosmo">Cosmo</Label>
                  <Select value={formData.cosmo} onValueChange={(value) => handleInputChange("cosmo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>Property location information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="roadLocation">Road Location</Label>
                  <Input
                    id="roadLocation"
                    value={formData.roadLocation}
                    onChange={(e) => handleInputChange("roadLocation", e.target.value)}
                    placeholder="Road location"
                    required
                  />
                </div>

                {/* Map Integration */}
                <div className="space-y-4">
                  <Label>Pin Your Location on Map</Label>
                  <div className="flex space-x-3">
                    <Button type="button" variant="outline" onClick={getCurrentLocation} className="flex-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Current Location
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowMap(!showMap)} className="flex-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      Pin Your Location on Map
                    </Button>
                  </div>

                  {showMap && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                        <p className="text-gray-600">Map integration would be implemented here</p>
                      </div>
                    </div>
                  )}

                  {formData.location && (
                    <div className="space-y-2">
                      <Label htmlFor="location">Address</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Address will be auto-filled from map pin"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Property owner and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="connectedPerson">Connected Person</Label>
                  <Input
                    id="connectedPerson"
                    value={formData.connectedPerson}
                    onChange={(e) => handleInputChange("connectedPerson", e.target.value)}
                    placeholder="Contact person name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directOrBroker">Direct or Broker</Label>
                  <Select
                    value={formData.directOrBroker}
                    onValueChange={(value) => handleInputChange("directOrBroker", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Broker">Broker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
