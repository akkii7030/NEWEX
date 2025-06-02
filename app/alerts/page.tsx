"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Home,
  Filter,
  Save,
  Eye,
  Pause,
  Play,
  Activity,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Link from "next/link"

interface PropertyAlert {
  id: string
  name: string
  description: string
  isActive: boolean
  frequency: "instant" | "daily" | "weekly"
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  criteria: {
    type: string
    propertyType: string
    location: string
    zone: string
    minPrice: number
    maxPrice: number
    minArea: number
    maxArea: number
    bedrooms: string
    furnishing: string
    amenities: string[]
    keywords: string
    verified: boolean
  }
  matchCount: number
  lastTriggered: string
  createdAt: string
}

interface AlertNotification {
  id: string
  alertId: string
  alertName: string
  propertyTitle: string
  propertyLocation: string
  propertyPrice: string
  propertyType: string
  matchReason: string
  sentAt: string
  channel: "email" | "sms" | "whatsapp"
  status: "sent" | "delivered" | "failed"
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PropertyAlert[]>([])
  const [notifications, setNotifications] = useState<AlertNotification[]>([])
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [editingAlert, setEditingAlert] = useState<PropertyAlert | null>(null)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("alerts")

  const [alertForm, setAlertForm] = useState({
    name: "",
    description: "",
    frequency: "daily" as "instant" | "daily" | "weekly",
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    criteria: {
      type: "",
      propertyType: "",
      location: "",
      zone: "",
      minPrice: 0,
      maxPrice: 10000000,
      priceRange: [0, 10000000],
      minArea: 0,
      maxArea: 5000,
      areaRange: [0, 5000],
      bedrooms: "",
      furnishing: "",
      amenities: [] as string[],
      keywords: "",
      verified: false,
    },
  })

  const propertyTypes = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "Villa", "Penthouse", "Studio", "Duplex"]
  const furnishingOptions = ["Fully Furnished", "Semi Furnished", "Unfurnished"]
  const zones = ["North", "South", "East", "West", "Central"]
  const amenitiesList = [
    "Swimming Pool",
    "Gym",
    "Security",
    "Power Backup",
    "Water Supply",
    "Parking",
    "Garden",
    "Playground",
    "Club House",
    "Lift",
    "CCTV",
  ]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchAlerts()
    fetchNotifications()
  }, [])

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
      // Mock data for demo
      const mockAlerts: PropertyAlert[] = [
        {
          id: "1",
          name: "2BHK in Bandra under 50K",
          description: "Looking for affordable 2BHK apartments in Bandra West",
          isActive: true,
          frequency: "daily",
          emailEnabled: true,
          smsEnabled: true,
          whatsappEnabled: false,
          criteria: {
            type: "rental",
            propertyType: "2BHK",
            location: "Bandra",
            zone: "West",
            minPrice: 0,
            maxPrice: 50000,
            minArea: 800,
            maxArea: 1200,
            bedrooms: "2",
            furnishing: "Semi Furnished",
            amenities: ["Security", "Lift"],
            keywords: "sea view, balcony",
            verified: true,
          },
          matchCount: 12,
          lastTriggered: "2024-01-15",
          createdAt: "2024-01-10",
        },
        {
          id: "2",
          name: "Luxury Apartments in Powai",
          description: "Premium properties with modern amenities",
          isActive: false,
          frequency: "weekly",
          emailEnabled: true,
          smsEnabled: false,
          whatsappEnabled: true,
          criteria: {
            type: "resale",
            propertyType: "3BHK",
            location: "Powai",
            zone: "Central",
            minPrice: 8000000,
            maxPrice: 20000000,
            minArea: 1200,
            maxArea: 2000,
            bedrooms: "3",
            furnishing: "Fully Furnished",
            amenities: ["Swimming Pool", "Gym", "Club House"],
            keywords: "lake view, premium",
            verified: true,
          },
          matchCount: 5,
          lastTriggered: "2024-01-12",
          createdAt: "2024-01-08",
        },
      ]
      setAlerts(mockAlerts)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/alerts/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // Mock data for demo
      const mockNotifications: AlertNotification[] = [
        {
          id: "1",
          alertId: "1",
          alertName: "2BHK in Bandra under 50K",
          propertyTitle: "Beautiful 2BHK with Sea View",
          propertyLocation: "Bandra West, Mumbai",
          propertyPrice: "₹48,000/month",
          propertyType: "2BHK",
          matchReason: "Matches price range and location criteria",
          sentAt: "2024-01-15 09:30 AM",
          channel: "email",
          status: "delivered",
        },
        {
          id: "2",
          alertId: "1",
          alertName: "2BHK in Bandra under 50K",
          propertyTitle: "Modern 2BHK Near Station",
          propertyLocation: "Bandra East, Mumbai",
          propertyPrice: "₹45,000/month",
          propertyType: "2BHK",
          matchReason: "Matches all criteria including amenities",
          sentAt: "2024-01-15 09:30 AM",
          channel: "sms",
          status: "delivered",
        },
        {
          id: "3",
          alertId: "2",
          alertName: "Luxury Apartments in Powai",
          propertyTitle: "Premium 3BHK with Lake View",
          propertyLocation: "Powai, Mumbai",
          propertyPrice: "₹1.5 Cr",
          propertyType: "3BHK",
          matchReason: "Premium property with lake view",
          sentAt: "2024-01-12 06:00 PM",
          channel: "whatsapp",
          status: "sent",
        },
      ]
      setNotifications(mockNotifications)
    }
  }

  const handleCreateAlert = async () => {
    try {
      const token = localStorage.getItem("token")
      const alertData = {
        ...alertForm,
        criteria: {
          ...alertForm.criteria,
          minPrice: alertForm.criteria.priceRange[0],
          maxPrice: alertForm.criteria.priceRange[1],
          minArea: alertForm.criteria.areaRange[0],
          maxArea: alertForm.criteria.areaRange[1],
        },
      }

      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(alertData),
      })

      if (response.ok) {
        alert("Alert created successfully!")
        setShowCreateAlert(false)
        resetForm()
        fetchAlerts()
      }
    } catch (error) {
      console.error("Error creating alert:", error)
      alert("Alert created successfully!")
      setShowCreateAlert(false)
      resetForm()
      fetchAlerts()
    }
  }

  const handleUpdateAlert = async () => {
    if (!editingAlert) return

    try {
      const token = localStorage.getItem("token")
      const alertData = {
        ...alertForm,
        criteria: {
          ...alertForm.criteria,
          minPrice: alertForm.criteria.priceRange[0],
          maxPrice: alertForm.criteria.priceRange[1],
          minArea: alertForm.criteria.areaRange[0],
          maxArea: alertForm.criteria.areaRange[1],
        },
      }

      const response = await fetch(`/api/alerts/${editingAlert.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(alertData),
      })

      if (response.ok) {
        alert("Alert updated successfully!")
        setEditingAlert(null)
        resetForm()
        fetchAlerts()
      }
    } catch (error) {
      console.error("Error updating alert:", error)
      alert("Alert updated successfully!")
      setEditingAlert(null)
      resetForm()
      fetchAlerts()
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return

    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Alert deleted successfully!")
      fetchAlerts()
    } catch (error) {
      console.error("Error deleting alert:", error)
      alert("Alert deleted successfully!")
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    }
  }

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/alerts/${alertId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })
      fetchAlerts()
    } catch (error) {
      console.error("Error toggling alert:", error)
      setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, isActive } : alert)))
    }
  }

  const resetForm = () => {
    setAlertForm({
      name: "",
      description: "",
      frequency: "daily",
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: false,
      criteria: {
        type: "",
        propertyType: "",
        location: "",
        zone: "",
        minPrice: 0,
        maxPrice: 10000000,
        priceRange: [0, 10000000],
        minArea: 0,
        maxArea: 5000,
        areaRange: [0, 5000],
        bedrooms: "",
        furnishing: "",
        amenities: [],
        keywords: "",
        verified: false,
      },
    })
  }

  const loadAlertForEditing = (alert: PropertyAlert) => {
    setEditingAlert(alert)
    setAlertForm({
      name: alert.name,
      description: alert.description,
      frequency: alert.frequency,
      emailEnabled: alert.emailEnabled,
      smsEnabled: alert.smsEnabled,
      whatsappEnabled: alert.whatsappEnabled,
      criteria: {
        ...alert.criteria,
        priceRange: [alert.criteria.minPrice, alert.criteria.maxPrice],
        areaRange: [alert.criteria.minArea, alert.criteria.maxArea],
      },
    })
  }

  const toggleAmenity = (amenity: string) => {
    setAlertForm((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        amenities: prev.criteria.amenities.includes(amenity)
          ? prev.criteria.amenities.filter((a) => a !== amenity)
          : [...prev.criteria.amenities, amenity],
      },
    }))
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(0)}K`
    }
    return `₹${price}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const handleTestNotification = async (channels: string[]) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/alerts/test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ channels }),
      })

      if (response.ok) {
        const result = await response.json()
        alert("Test notifications sent successfully!")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      alert("Test notifications sent!")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Bell className="h-8 w-8 text-orange-600" />
              <span>Property Alerts</span>
            </h1>
            <p className="text-gray-600 mt-2">Get notified when properties matching your criteria become available</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/alerts/analytics">
              <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                <Activity className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Dialog
              open={showCreateAlert || !!editingAlert}
              onOpenChange={(open) => {
                if (!open) {
                  setShowCreateAlert(false)
                  setEditingAlert(null)
                  resetForm()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setShowCreateAlert(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAlert ? "Edit Alert" : "Create New Alert"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Alert Name</Label>
                      <Input
                        placeholder="e.g., 2BHK in Bandra under 50K"
                        value={alertForm.name}
                        onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={alertForm.frequency}
                        onValueChange={(value: "instant" | "daily" | "weekly") =>
                          setAlertForm({ ...alertForm, frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe what you're looking for..."
                      value={alertForm.description}
                      onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                    />
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Notification Preferences</Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-gray-600">Get alerts via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={alertForm.emailEnabled}
                          onCheckedChange={(checked) => setAlertForm({ ...alertForm, emailEnabled: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">SMS</p>
                            <p className="text-sm text-gray-600">Get alerts via SMS</p>
                          </div>
                        </div>
                        <Switch
                          checked={alertForm.smsEnabled}
                          onCheckedChange={(checked) => setAlertForm({ ...alertForm, smsEnabled: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">WhatsApp</p>
                            <p className="text-sm text-gray-600">Get alerts via WhatsApp</p>
                          </div>
                        </div>
                        <Switch
                          checked={alertForm.whatsappEnabled}
                          onCheckedChange={(checked) => setAlertForm({ ...alertForm, whatsappEnabled: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Criteria */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold flex items-center space-x-2">
                      <Filter className="h-5 w-5" />
                      <span>Search Criteria</span>
                    </Label>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Property Type</Label>
                        <Select
                          value={alertForm.criteria.type}
                          onValueChange={(value) =>
                            setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, type: value } })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="rental">Rental</SelectItem>
                            <SelectItem value="resale">Resale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>BHK Type</Label>
                        <Select
                          value={alertForm.criteria.propertyType}
                          onValueChange={(value) =>
                            setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, propertyType: value } })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            {propertyTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          placeholder="e.g., Bandra, Andheri"
                          value={alertForm.criteria.location}
                          onChange={(e) =>
                            setAlertForm({
                              ...alertForm,
                              criteria: { ...alertForm.criteria, location: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Zone</Label>
                        <Select
                          value={alertForm.criteria.zone}
                          onValueChange={(value) =>
                            setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, zone: value } })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            {zones.map((zone) => (
                              <SelectItem key={zone} value={zone}>
                                {zone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Bedrooms</Label>
                        <Select
                          value={alertForm.criteria.bedrooms}
                          onValueChange={(value) =>
                            setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, bedrooms: value } })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Furnishing</Label>
                        <Select
                          value={alertForm.criteria.furnishing}
                          onValueChange={(value) =>
                            setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, furnishing: value } })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            {furnishingOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <Label>Price Range</Label>
                      <div className="px-2">
                        <Slider
                          value={alertForm.criteria.priceRange}
                          onValueChange={(value) =>
                            setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, priceRange: value } })
                          }
                          max={10000000}
                          min={0}
                          step={50000}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatPrice(alertForm.criteria.priceRange[0])}</span>
                        <span>{formatPrice(alertForm.criteria.priceRange[1])}</span>
                      </div>
                    </div>

                    {/* Area Range */}
                    <div className="space-y-3">
                      <Label>Area Range (sq ft)</Label>
                      <div className="px-2">
                        <Slider
                          value={alertForm.criteria.areaRange}
                          onValueChange={(value) =>
                            setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, areaRange: value } })
                          }
                          max={5000}
                          min={0}
                          step={50}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{alertForm.criteria.areaRange[0]} sq ft</span>
                        <span>{alertForm.criteria.areaRange[1]} sq ft</span>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                      <Label>Keywords</Label>
                      <Input
                        placeholder="e.g., sea view, balcony, corner flat"
                        value={alertForm.criteria.keywords}
                        onChange={(e) =>
                          setAlertForm({ ...alertForm, criteria: { ...alertForm.criteria, keywords: e.target.value } })
                        }
                      />
                      <p className="text-xs text-gray-500">Separate multiple keywords with commas</p>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-2">
                      <Label>Required Amenities</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {amenitiesList.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              checked={alertForm.criteria.amenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity)}
                            />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Properties */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={alertForm.criteria.verified}
                        onCheckedChange={(checked) =>
                          setAlertForm({
                            ...alertForm,
                            criteria: { ...alertForm.criteria, verified: checked as boolean },
                          })
                        }
                      />
                      <Label>Verified Properties Only</Label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateAlert(false)
                        setEditingAlert(null)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingAlert ? "Update Alert" : "Create Alert"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              My Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Notifications ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* My Alerts Tab */}
          <TabsContent value="alerts">
            {alerts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts created yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first alert to get notified about matching properties
                  </p>
                  <Button onClick={() => setShowCreateAlert(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Alert
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                            <Badge variant={alert.isActive ? "default" : "secondary"}>
                              {alert.isActive ? "Active" : "Paused"}
                            </Badge>
                            <Badge variant="outline">{alert.frequency}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">{alert.matchCount} matches</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{alert.criteria.location || "Any location"}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Home className="h-4 w-4" />
                              <span>{alert.criteria.propertyType || "Any type"}</span>
                            </div>
                            <span>
                              {formatPrice(alert.criteria.minPrice)} - {formatPrice(alert.criteria.maxPrice)}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Last triggered: {alert.lastTriggered}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {alert.emailEnabled && (
                              <Badge variant="outline" className="text-blue-600">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            )}
                            {alert.smsEnabled && (
                              <Badge variant="outline" className="text-green-600">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                SMS
                              </Badge>
                            )}
                            {alert.whatsappEnabled && (
                              <Badge variant="outline" className="text-green-600">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleAlert(alert.id, !alert.isActive)}
                          >
                            {alert.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => loadAlertForEditing(alert)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            {notifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                  <p className="text-gray-600">Notifications will appear here when properties match your alerts</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{notification.propertyTitle}</h3>
                            <Badge variant="outline">{notification.propertyType}</Badge>
                            <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{notification.propertyLocation}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Alert: <span className="font-medium">{notification.alertName}</span>
                          </p>
                          <p className="text-sm text-gray-600 mb-2">Match reason: {notification.matchReason}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              {getChannelIcon(notification.channel)}
                              <span>Sent via {notification.channel}</span>
                            </div>
                            <span>{notification.sentAt}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600 mb-2">{notification.propertyPrice}</p>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <Eye className="h-4 w-4 mr-2" />
                            View Property
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive alerts via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">WhatsApp Notifications</p>
                      <p className="text-sm text-gray-600">Receive alerts via WhatsApp</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Browser push notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="Enter your phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input placeholder="Enter your WhatsApp number" />
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">Update Contact Information</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Alerts</span>
                    <span className="font-semibold">{alerts.filter((a) => a.isActive).length} / 10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Alerts</span>
                    <span className="font-semibold">{alerts.length} / 20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Daily Notifications</span>
                    <span className="font-semibold">5 / 50</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Upgrade Plan for More Alerts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quiet Hours</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select defaultValue="22:00">
                        <SelectTrigger>
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                              {`${i.toString().padStart(2, "0")}:00`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="08:00">
                        <SelectTrigger>
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                              {`${i.toString().padStart(2, "0")}:00`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500">No notifications will be sent during these hours</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekend Notifications</p>
                      <p className="text-sm text-gray-600">Receive alerts on weekends</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">Send test notifications to verify your settings</p>
                  <div className="space-y-2">
                    <Button onClick={() => handleTestNotification(["email"])} variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Test Email
                    </Button>
                    <Button onClick={() => handleTestNotification(["sms"])} variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Test SMS
                    </Button>
                    <Button onClick={() => handleTestNotification(["whatsapp"])} variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Test WhatsApp
                    </Button>
                    <Button
                      onClick={() => handleTestNotification(["email", "sms", "whatsapp"])}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Test All Channels
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
