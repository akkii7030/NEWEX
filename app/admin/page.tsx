"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Eye, Edit, Users, Building, Clock } from "lucide-react"
import Navbar from "@/components/navbar"

interface PendingListing {
  id: string
  type: "rental" | "resale"
  title: string
  location: string
  price: string
  ownerName: string
  contact: string
  createdAt: string
  status: string
  srNo?: string
  directOrBroker?: string
  buildingSociety?: string
  roadLocation?: string
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  reraNumber: string
  isSubscribed: boolean
  subscribedLocations: string[]
  createdAt: string
  role?: string // Added role property, optional for backward compatibility
}

export default function AdminPage() {
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [user, setUser] = useState<any>(null)
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [adminLocation, setAdminLocation] = useState<string>("")
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null)
  const [activeListingsCount, setActiveListingsCount] = useState<number>(0)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      if (parsedUser.role !== "admin") {
        window.location.href = "/my-inventories"
        return
      }
      fetchPendingListings()
      fetchUsers()
    } else {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAdminLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
        },
        (error) => setAdminLocation("Location access denied")
      )
    }
  }, [])

  const fetchPendingListings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/pending-listings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // Ensure each listing has an 'id' property
        setPendingListings(
          data.map((listing: any) => ({
            ...listing,
            id: listing._id || listing.id, // fallback for mock data
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching pending listings:", error)
      // Mock data for demo
      setPendingListings([
        {
          id: "1",
          type: "resale",
          title: "Luxury 3BHK Apartment",
          location: "Powai, Mumbai",
          price: "₹1.2 Cr",
          ownerName: "John Doe",
          contact: "+91 9876543210",
          createdAt: "2024-01-15",
          status: "Pending",
          srNo: "1",
          directOrBroker: "Direct",
          buildingSociety: "Sunshine Apartments",
          roadLocation: "Main Road",
        },
        {
          id: "2",
          type: "rental",
          title: "Modern 2BHK Flat",
          location: "Andheri East, Mumbai",
          price: "₹35,000/month",
          ownerName: "Jane Smith",
          contact: "+91 9876543211",
          createdAt: "2024-01-14",
          status: "Pending",
          srNo: "2",
          directOrBroker: "Broker",
          buildingSociety: "Greenwood Society",
          roadLocation: "2nd Street",
        },
      ])
    }
  }

  const fetchActiveListingsCount = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/active-listings-count", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setActiveListingsCount(data.activeListingsCount || 0)
      }
    } catch (error) {
      console.error("Error fetching active listings count:", error)
    }
  }

  // Remove duplicate handleApproveListing function

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      // Mock data for demo
      setUsers([
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+91 9876543210",
          reraNumber: "MH123456",
          isSubscribed: true,
          subscribedLocations: ["andheri", "bandra"],
          createdAt: "2024-01-10",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+91 9876543211",
          reraNumber: "MH123457",
          isSubscribed: false,
          subscribedLocations: [],
          createdAt: "2024-01-12",
        },
      ])
    }
  }

  const handleApproveListing = async (listingId: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/admin/approve-listing/${listingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        alert("Listing approved successfully!")
        // Optionally redirect:
        // window.location.href = "/cp-dashboard"
        fetchPendingListings()
      } else {
        alert("Failed to approve listing")
      }
    } catch (error) {
      console.error("Error approving listing:", error)
      alert("Failed to approve listing")
    }
  }

  const handleRejectListing = async (listingId: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/admin/reject-listing/${listingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Listing rejected!")
      fetchPendingListings()
    } catch (error) {
      console.error("Error rejecting listing:", error)
      alert("Listing rejected!")
      setPendingListings((prev) => prev.filter((listing) => listing.id !== listingId))
    }
  }

  const handleUpdateListingVisibility = async (listingId: string, visibility: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/admin/update-visibility/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visibility }),
      })
      alert(`Listing visibility updated to ${visibility}`)
    } catch (error) {
      console.error("Error updating visibility:", error)
      alert(`Listing visibility updated to ${visibility}`)
    }
  }

  const handlePromoteUserToAdmin = async (userId: string) => {
    setPromotingUserId(userId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/admin/make-admin/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: "admin" }),
      })
      if (res.ok) {
        alert("User promoted to admin!")
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to promote user.")
      }
    } catch (err) {
      alert("Error promoting user.")
    }
    setPromotingUserId(null)
  }

  const handleRemoveListing = async (listingId: string) => {
    const confirmed = confirm("Are you sure you want to remove this listing?")
    if (!confirmed) return

    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/admin/remove-listing/${listingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Listing removed successfully!")
      fetchPendingListings()
    } catch (error) {
      console.error("Error removing listing:", error)
      alert("Failed to remove listing")
    }
  }

  const fetchAllListings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/listings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // Process data if needed
      }
    } catch (error) {
      console.error("Error fetching all listings:", error)
    }
  }

  useEffect(() => {
    fetchAllListings()
  }, [])

  if (!user || user.role !== "admin") {
    return <div>Access Denied</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage listings, users, and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingListings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscribed Users</p>
                  <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.isSubscribed).length}</p>
                </div>
                <Building className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-purple-600">{activeListingsCount}</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Pending Approvals ({pendingListings.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              All Listings
            </TabsTrigger>
          </TabsList>


          {/* Pending Approvals Tab */}
          <TabsContent value="pending">
            <div className="space-y-4">
          {pendingListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending approvals</p>
            </div>
          ) : (
            pendingListings.map((listing) => (
              <Card key={listing.id}>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div><b>Sr. No.:</b> {listing.srNo}</div>
                      <div><b>Direct / Broker:</b> {listing.directOrBroker}</div>
                      <div><b>Building / Society name:</b> {listing.buildingSociety}</div>
                      <div><b>Road / Location:</b> {listing.roadLocation}</div>
                      {/* ...all other fields... */}
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => { setSelectedListing(listing); setShowDetailModal(true); }}>
                        <Eye />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveListing(listing.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleRejectListing(listing.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
            </div>

            {/* Modal for full details */}
            {showDetailModal && selectedListing && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">{selectedListing.title}</h2>
                  {Object.entries(selectedListing).map(([key, value]) => (
                    <p key={key}><b>{key}:</b> {String(value)}</p>
                  ))}
                  <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={() => handleApproveListing(selectedListing.id)}>
                    Approve
                  </Button>
                  <Button className="mt-4 ml-4 bg-red-600 hover:bg-red-700" onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <Badge variant={user.isSubscribed ? "default" : "outline"}>
                            {user.isSubscribed ? "Subscribed" : "Free"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Email: {user.email}</span>
                          <span>Phone: {user.phone}</span>
                          <span>RERA: {user.reraNumber}</span>
                          <span>Joined: {user.createdAt}</span>
                        </div>
                        {user.subscribedLocations.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Subscribed Locations: </span>
                            {user.subscribedLocations.map((location) => (
                              <Badge key={location} variant="outline" className="mr-1">
                                {location}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.role !== "admin" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={promotingUserId === user.id}
                            onClick={() => handlePromoteUserToAdmin(user.id)}
                          >
                            {promotingUserId === user.id ? "Promoting..." : "Make Admin"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Listings Tab */}
          <TabsContent value="listings">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manage Listing Visibility</h3>
                <Select onValueChange={(value) => console.log("Bulk action:", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Set Available</SelectItem>
                    <SelectItem value="sold">Set Sold Out</SelectItem>
                    <SelectItem value="hold">Set Hold</SelectItem>
                    <SelectItem value="hidden">Set Hidden</SelectItem>
                    <SelectItem value="global">Set Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">All listings management interface would be implemented here</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Features: Visibility controls, bulk actions, status updates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {showDetailModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{selectedListing.title}</h2>
              {Object.entries(selectedListing).map(([key, value]) => (
                <p key={key}><b>{key}:</b> {String(value)}</p>
              ))}
              <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Show adminLocation for debugging - remove in production */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700">Admin Location (for debugging):</h4>
          <p className="text-gray-900">{adminLocation}</p>
        </div>
      </div>
    </div>
  )
}
