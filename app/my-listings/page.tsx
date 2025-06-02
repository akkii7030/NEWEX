"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Edit, Trash2, Eye, Plus, Lock } from "lucide-react"
import Navbar from "@/components/navbar"

interface Listing {
  id: string
  type: "rental" | "resale"
  title: string
  location: string
  price: string
  status: string
  createdAt: string
  views: number
  inquiries: number
}

export default function MyListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Mock listings data
    const mockListings: Listing[] = [
      {
        id: "1",
        type: "rental",
        title: "Spacious 2BHK in Bandra",
        location: "Bandra West, Mumbai",
        price: "₹45,000/month",
        status: "Active",
        createdAt: "2024-01-15",
        views: 156,
        inquiries: 12,
      },
      {
        id: "2",
        type: "resale",
        title: "Luxury 3BHK Apartment",
        location: "Powai, Mumbai",
        price: "₹1.2 Cr",
        status: "Pending",
        createdAt: "2024-01-10",
        views: 89,
        inquiries: 7,
      },
      {
        id: "3",
        type: "rental",
        title: "Modern 1BHK Studio",
        location: "Andheri East, Mumbai",
        price: "₹28,000/month",
        status: "Rented",
        createdAt: "2024-01-05",
        views: 234,
        inquiries: 18,
      },
      {
        id: "4",
        type: "resale",
        title: "Premium Villa",
        location: "Juhu, Mumbai",
        price: "₹3.5 Cr",
        status: "Active",
        createdAt: "2024-01-01",
        views: 67,
        inquiries: 4,
      },
    ]

    setListings(mockListings)
    setFilteredListings(mockListings)
  }, [])

  useEffect(() => {
    let filtered = listings

    if (searchTerm) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((listing) => listing.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((listing) => listing.status === statusFilter)
    }

    setFilteredListings(filtered)
  }, [searchTerm, typeFilter, statusFilter, listings])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      setListings((prev) => prev.filter((listing) => listing.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
              <p className="text-gray-600">Manage all your property listings in one place.</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => router.push("/add-rental")} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Rental
              </Button>
              <Button onClick={() => router.push("/add-resale")} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Resale
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {listings.filter((l) => l.status === "Active").length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600">{listings.reduce((sum, l) => sum + l.views, 0)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {listings.reduce((sum, l) => sum + l.inquiries, 0)}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Eye className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="resale">Resale</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setTypeFilter("all")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="space-y-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user && !user.isSubscribed && <Lock className="h-5 w-5 text-gray-400" />}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                      <p className="text-gray-600">{listing.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={listing.type === "rental" ? "default" : "secondary"}>{listing.type}</Badge>
                        <Badge
                          variant={
                            listing.status === "Active"
                              ? "default"
                              : listing.status === "Pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Views</p>
                      <p className="text-lg font-semibold">{listing.views}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Inquiries</p>
                      <p className="text-lg font-semibold">{listing.inquiries}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{listing.price}</p>
                      <p className="text-sm text-gray-500">Listed on {listing.createdAt}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(listing.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or create a new listing.</p>
              <div className="flex justify-center space-x-3">
                <Button onClick={() => router.push("/add-rental")} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rental
                </Button>
                <Button onClick={() => router.push("/add-resale")} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resale
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
