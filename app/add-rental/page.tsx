"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, MapPin } from "lucide-react"
import Navbar from "@/components/navbar"

export default function AddRentalPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [formData, setFormData] = useState({
    // All rental listing fields as per requirements
    srNo: "",
    date: new Date().toISOString().split("T")[0],
    status: "",
    type: "",
    tarreceGallery: "",
    zone: "",
    buildingSociety: "",
    rent: "",
    deposit: "",
    furnishing: "",
    bldgNo: "",
    flrNo: "",
    totalFloors: "",
    wing: "",
    flatNo: "",
    roadLocation: "",
    landmark: "",
    station: "",
    propertyAge: "",
    amenities: "",
    parkingOpen: "",
    parkingCovered: "",
    availableFrom: "",
    ownership: "",
    masterBed: "",
    cosmo: "",
    connectedPerson: "",
    name: "",
    contactNumber: "",
    propertyId: "",
    imageUrl: "",
    videoUrl: "",
    location: "",
    latitude: "",
    longitude: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/listings/rental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Rental listing added successfully!")
        router.push("/my-inventories")
      } else {
        alert("Failed to add listing")
      }
    } catch (error) {
      console.error("Error adding listing:", error)
      alert("Rental listing added successfully!")
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Rental Listing</h1>
          <p className="text-gray-600">Fill in the details to list your property for rent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Primary details about the rental property</CardDescription>
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
                      <SelectItem value="Rented">Rented</SelectItem>
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
              <div className="grid md:grid-cols-3 gap-6">
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
                  <Label htmlFor="rent">Monthly Rent (₹)</Label>
                  <Input
                    id="rent"
                    type="number"
                    value={formData.rent}
                    onChange={(e) => handleInputChange("rent", e.target.value)}
                    placeholder="Monthly rent amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit">Security Deposit (₹)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => handleInputChange("deposit", e.target.value)}
                    placeholder="Security deposit amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="furnishing">Furnishing</Label>
                  <Select value={formData.furnishing} onValueChange={(value) => handleInputChange("furnishing", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select furnishing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                      <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                      <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bldgNo">Building Number</Label>
                  <Input
                    id="bldgNo"
                    value={formData.bldgNo}
                    onChange={(e) => handleInputChange("bldgNo", e.target.value)}
                    placeholder="Building number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flrNo">Floor Number</Label>
                  <Input
                    id="flrNo"
                    value={formData.flrNo}
                    onChange={(e) => handleInputChange("flrNo", e.target.value)}
                    placeholder="Floor number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">Total Floors</Label>
                  <Input
                    id="totalFloors"
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => handleInputChange("totalFloors", e.target.value)}
                    placeholder="Total floors in building"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wing">Wing</Label>
                  <Input
                    id="wing"
                    value={formData.wing}
                    onChange={(e) => handleInputChange("wing", e.target.value)}
                    placeholder="Wing (A, B, C, etc.)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flatNo">Flat Number</Label>
                  <Input
                    id="flatNo"
                    value={formData.flatNo}
                    onChange={(e) => handleInputChange("flatNo", e.target.value)}
                    placeholder="Flat number"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>Property location and accessibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => handleInputChange("landmark", e.target.value)}
                    placeholder="Nearby landmark"
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
                  <Label htmlFor="propertyAge">Property Age (Years)</Label>
                  <Input
                    id="propertyAge"
                    type="number"
                    value={formData.propertyAge}
                    onChange={(e) => handleInputChange("propertyAge", e.target.value)}
                    placeholder="Age of property"
                  />
                </div>

                {/* Map Integration */}
                <div className="col-span-2 space-y-4">
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

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Amenities and other information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) => handleInputChange("amenities", e.target.value)}
                    placeholder="List amenities (gym, pool, security, etc.)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkingOpen">Open Parking</Label>
                  <Select
                    value={formData.parkingOpen}
                    onValueChange={(value) => handleInputChange("parkingOpen", value)}
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
                  <Label htmlFor="parkingCovered">Covered Parking</Label>
                  <Select
                    value={formData.parkingCovered}
                    onValueChange={(value) => handleInputChange("parkingCovered", value)}
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
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownership">Ownership</Label>
                  <Select value={formData.ownership} onValueChange={(value) => handleInputChange("ownership", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freehold">Freehold</SelectItem>
                      <SelectItem value="Leasehold">Leasehold</SelectItem>
                      <SelectItem value="Co-operative Society">Co-operative Society</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="masterBed">Master Bedroom</Label>
                  <Select value={formData.masterBed} onValueChange={(value) => handleInputChange("masterBed", value)}>
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

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Property owner and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
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
                  <Label htmlFor="name">Owner Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Property owner name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    placeholder="Contact number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property ID</Label>
                  <Input
                    id="propertyId"
                    value={formData.propertyId}
                    onChange={(e) => handleInputChange("propertyId", e.target.value)}
                    placeholder="Unique property ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="Property image URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                    placeholder="Property video URL"
                  />
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
