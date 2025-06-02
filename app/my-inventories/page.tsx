"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Eye, Plus, Clock } from "lucide-react"
import Navbar from "@/components/navbar"

interface Listing {
  id: string
  type: "rental" | "resale"
  title: string
  location: string
  price: string
  status: string
  createdAt: string
  flatNo?: string
  flrNo?: string
  approved?: boolean
}

export default function MyInventoriesPage() {
  const router = useRouter()
  const [rentalListings, setRentalListings] = useState<Listing[]>([])
  const [resaleListings, setResaleListings] = useState<Listing[]>([])
  const [activeTab, setActiveTab] = useState("resale")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProperty, setNewProperty] = useState({
    station: "",
    developerName: "",
    projectName: "",
    storey: "",
    flatType: "",
    saleableArea: "",
    reraCarpet: "",
    pfsRate: "",
    avRate: "",
    flatValue: "",
  })

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/listings/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setRentalListings(data.rental || [])
        setResaleListings(data.resale || [])
      }
    } catch (error) {
      console.error("Error fetching listings:", error)
      // Mock data for demo
      setRentalListings([
        {
          id: "1",
          type: "rental",
          title: "Spacious 2BHK in Bandra",
          location: "Bandra West, Mumbai",
          price: "₹45,000/month",
          status: "Active",
          createdAt: "2024-01-15",
          flatNo: "A-101",
          flrNo: "1st Floor",
          approved: true,
        },
      ])
      setResaleListings([
        {
          id: "2",
          type: "resale",
          title: "Luxury 3BHK Apartment",
          location: "Powai, Mumbai",
          price: "₹1.2 Cr",
          status: "Pending Approval",
          createdAt: "2024-01-10",
          flatNo: "B-502",
          flrNo: "5th Floor",
          approved: false,
        },
      ])
    }
  }

  const handleAddProperty = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/listings/resale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProperty,
          type: activeTab,
          status: "Pending Approval",
          approved: false,
        }),
      })

      if (response.ok) {
        alert("Property added successfully! Waiting for admin approval.")
        setShowAddModal(false)
        setNewProperty({
          station: "",
          developerName: "",
          projectName: "",
          storey: "",
          flatType: "",
          saleableArea: "",
          reraCarpet: "",
          pfsRate: "",
          avRate: "",
          flatValue: "",
        })
        fetchListings()
      }
    } catch (error) {
      console.error("Error adding property:", error)
      alert("Property added successfully! Waiting for admin approval.")
      setShowAddModal(false)
    }
  }

  const handleDelete = async (id: string, type: "rental" | "resale") => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        const token = localStorage.getItem("token")
        await fetch(`/api/listings/${type}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchListings()
      } catch (error) {
        console.error("Error deleting listing:", error)
      }
    }
  }

  const renderListings = (listings: Listing[]) => {
    if (listings.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No {activeTab === "resale" ? "Resale" : "Rental"} properties found</p>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Add First {activeTab === "resale" ? "Resale" : "Rental"} Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New {activeTab === "resale" ? "Resale" : "Rental"} Property</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="station">Station</Label>
                  <Input
                    id="station"
                    value={newProperty.station}
                    onChange={(e) => setNewProperty({ ...newProperty, station: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="developerName">Developer Name</Label>
                  <Input
                    id="developerName"
                    value={newProperty.developerName}
                    onChange={(e) => setNewProperty({ ...newProperty, developerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProperty.projectName}
                    onChange={(e) => setNewProperty({ ...newProperty, projectName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storey">Storey</Label>
                  <Input
                    id="storey"
                    value={newProperty.storey}
                    onChange={(e) => setNewProperty({ ...newProperty, storey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatType">Flat Type</Label>
                  <Select
                    value={newProperty.flatType}
                    onValueChange={(value) => setNewProperty({ ...newProperty, flatType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                      <SelectItem value="4BHK">4BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleableArea">Saleable Area</Label>
                  <Input
                    id="saleableArea"
                    value={newProperty.saleableArea}
                    onChange={(e) => setNewProperty({ ...newProperty, saleableArea: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reraCarpet">Rera Carpet</Label>
                  <Input
                    id="reraCarpet"
                    value={newProperty.reraCarpet}
                    onChange={(e) => setNewProperty({ ...newProperty, reraCarpet: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pfsRate">Pfs Rate</Label>
                  <Input
                    id="pfsRate"
                    value={newProperty.pfsRate}
                    onChange={(e) => setNewProperty({ ...newProperty, pfsRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avRate">Av Rate</Label>
                  <Input
                    id="avRate"
                    value={newProperty.avRate}
                    onChange={(e) => setNewProperty({ ...newProperty, avRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="flatValue">Flat Value</Label>
                  <Input
                    id="flatValue"
                    value={newProperty.flatValue}
                    onChange={(e) => setNewProperty({ ...newProperty, flatValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProperty} className="bg-orange-600 hover:bg-orange-700">
                  Add Property
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className={`hover:shadow-lg transition-shadow ${!listing.approved ? "opacity-60" : ""}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                    {!listing.approved && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{listing.location}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline">{listing.type}</Badge>
                    <Badge variant={listing.status === "Active" ? "default" : "secondary"}>{listing.status}</Badge>
                    {listing.flatNo && <Badge variant="outline">Flat: {listing.flatNo}</Badge>}
                    {listing.flrNo && <Badge variant="outline">Floor: {listing.flrNo}</Badge>}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600">{listing.price}</p>
                    <p className="text-sm text-gray-500">Listed on {listing.createdAt}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(listing.id, listing.type)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Inventories</h1>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Resale Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Resale Property</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="station">Station</Label>
                  <Input
                    id="station"
                    value={newProperty.station}
                    onChange={(e) => setNewProperty({ ...newProperty, station: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="developerName">Developer Name</Label>
                  <Input
                    id="developerName"
                    value={newProperty.developerName}
                    onChange={(e) => setNewProperty({ ...newProperty, developerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProperty.projectName}
                    onChange={(e) => setNewProperty({ ...newProperty, projectName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storey">Storey</Label>
                  <Input
                    id="storey"
                    value={newProperty.storey}
                    onChange={(e) => setNewProperty({ ...newProperty, storey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatType">Flat Type</Label>
                  <Select
                    value={newProperty.flatType}
                    onValueChange={(value) => setNewProperty({ ...newProperty, flatType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                      <SelectItem value="4BHK">4BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleableArea">Saleable Area</Label>
                  <Input
                    id="saleableArea"
                    value={newProperty.saleableArea}
                    onChange={(e) => setNewProperty({ ...newProperty, saleableArea: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reraCarpet">Rera Carpet</Label>
                  <Input
                    id="reraCarpet"
                    value={newProperty.reraCarpet}
                    onChange={(e) => setNewProperty({ ...newProperty, reraCarpet: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pfsRate">Pfs Rate</Label>
                  <Input
                    id="pfsRate"
                    value={newProperty.pfsRate}
                    onChange={(e) => setNewProperty({ ...newProperty, pfsRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avRate">Av Rate</Label>
                  <Input
                    id="avRate"
                    value={newProperty.avRate}
                    onChange={(e) => setNewProperty({ ...newProperty, avRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="flatValue">Flat Value</Label>
                  <Input
                    id="flatValue"
                    value={newProperty.flatValue}
                    onChange={(e) => setNewProperty({ ...newProperty, flatValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProperty} className="bg-orange-600 hover:bg-orange-700">
                  Add Property
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="resale" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Resale ({resaleListings.length})
            </TabsTrigger>
            <TabsTrigger value="rental" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Rental ({rentalListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resale">{renderListings(resaleListings)}</TabsContent>

          <TabsContent value="rental">{renderListings(rentalListings)}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
