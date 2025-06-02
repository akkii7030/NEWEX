"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Phone,
  MessageCircle,
  RotateCcw,
  Search,
  Filter,
  Save,
  Home,
  Building,
  Car,
  Shield,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Bookmark,
  X,
  Eye,
} from "lucide-react"
import Navbar from "@/components/navbar"

interface Listing {
  id: string
  type: "rental" | "resale"
  title: string
  location: string
  price: string
  priceNumeric: number
  status: string
  contact: string
  email: string
  createdAt: string
  zone: string
  station: string
  buildingSociety: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  area: number
  furnishing: string
  parking: boolean
  amenities: string[]
  propertyAge: number
  floor: number
  totalFloors: number
  facing: string
  availability: string
  images: string[]
  description: string
  ownerType: string
  verified: boolean
}

interface SavedSearch {
  id: string
  name: string
  filters: any
  createdAt: string
}

export default function CPDashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [selectedListings, setSelectedListings] = useState<string[]>([])
  const [activePropertyType, setActivePropertyType] = useState("Residential")
  const [user, setUser] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [searchName, setSearchName] = useState("")

  const [filters, setFilters] = useState({
    // Basic Filters
    searchQuery: "",
    status: "",
    type: "",
    station: "",
    zone: "",

    // Price Filters
    minPrice: 0,
    maxPrice: 10000000,
    priceRange: [0, 10000000],

    // Property Details
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    minArea: 0,
    maxArea: 5000,
    areaRange: [0, 5000],
    furnishing: "",

    // Location & Accessibility
    nearbyStations: [] as string[],
    maxDistanceFromStation: 5,

    // Building Features
    minFloor: 0,
    maxFloor: 50,
    floorRange: [0, 50],
    parking: "",
    facing: "",
    propertyAge: "",

    // Amenities
    amenities: [] as string[],

    // Availability
    availableFrom: "",
    ownerType: "",
    verified: false,

    // Advanced
    keywords: "",
    excludeKeywords: "",
  })

  const propertyTypes = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "Villa", "Penthouse", "Studio", "Duplex"]
  const furnishingOptions = ["Fully Furnished", "Semi Furnished", "Unfurnished"]
  const facingOptions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"]
  const ownerTypes = ["Owner", "Broker", "Builder"]
  const stations = [
    "Andheri",
    "Bandra",
    "Kandivali",
    "Borivali",
    "Malad",
    "Goregaon",
    "Powai",
    "Juhu",
    "Versova",
    "Ghatkopar",
  ]
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
    "Intercom",
    "Fire Safety",
    "Waste Management",
    "Wi-Fi",
    "AC",
    "Balcony",
  ]

  useEffect(() => {
    fetchAllListings()
    loadSavedSearches()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, listings, sortBy, sortOrder])

  const fetchAllListings = async () => {
    const response = await fetch("/api/listings/cp")
    if (response.ok) {
      const data = await response.json()
      setListings(data)
    }
  }

  const extractNumericPrice = (priceString: string): number => {
    const numericValue = priceString.replace(/[^\d.]/g, "")
    const value = Number.parseFloat(numericValue)

    if (priceString.includes("Cr")) {
      return value * 10000000
    } else if (priceString.includes("Lakh")) {
      return value * 100000
    } else if (priceString.includes("K")) {
      return value * 1000
    }
    return value || 0
  }

  const loadSavedSearches = () => {
    const saved = localStorage.getItem("savedSearches")
    if (saved) {
      setSavedSearches(JSON.parse(saved))
    }
  }

  const saveCurrentSearch = () => {
    if (!searchName.trim()) {
      alert("Please enter a name for your search")
      return
    }

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    }

    const updatedSearches = [...savedSearches, newSearch]
    setSavedSearches(updatedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches))
    setShowSaveSearch(false)
    setSearchName("")
    alert("Search saved successfully!")
  }

  const loadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters)
    alert(`Loaded search: ${search.name}`)
  }

  const deleteSavedSearch = (searchId: string) => {
    const updatedSearches = savedSearches.filter((s) => s.id !== searchId)
    setSavedSearches(updatedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches))
  }

  const applyFilters = () => {
    let filtered = [...listings]

    // Text search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.location.toLowerCase().includes(query) ||
          listing.buildingSociety.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query),
      )
    }

    // Keywords search
    if (filters.keywords) {
      const keywords = filters.keywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim())
      filtered = filtered.filter((listing) =>
        keywords.some(
          (keyword) =>
            listing.title.toLowerCase().includes(keyword) ||
            listing.description.toLowerCase().includes(keyword) ||
            listing.amenities.some((amenity) => amenity.toLowerCase().includes(keyword)),
        ),
      )
    }

    // Exclude keywords
    if (filters.excludeKeywords) {
      const excludeKeywords = filters.excludeKeywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim())
      filtered = filtered.filter(
        (listing) =>
          !excludeKeywords.some(
            (keyword) =>
              listing.title.toLowerCase().includes(keyword) || listing.description.toLowerCase().includes(keyword),
          ),
      )
    }

    // Basic filters
    if (filters.status && filters.status !== "All Status") {
      filtered = filtered.filter((listing) => listing.status === filters.status)
    }

    if (filters.type && filters.type !== "All Types") {
      filtered = filtered.filter((listing) => listing.type === filters.type)
    }

    if (filters.station && filters.station !== "All Stations") {
      filtered = filtered.filter((listing) => listing.station === filters.station)
    }

    if (filters.zone) {
      filtered = filtered.filter((listing) => listing.zone === filters.zone)
    }

    // Price range
    filtered = filtered.filter(
      (listing) => listing.priceNumeric >= filters.priceRange[0] && listing.priceNumeric <= filters.priceRange[1],
    )

    // Property details
    if (filters.propertyType) {
      filtered = filtered.filter((listing) => listing.propertyType === filters.propertyType)
    }

    if (filters.bedrooms) {
      filtered = filtered.filter((listing) => listing.bedrooms === Number.parseInt(filters.bedrooms))
    }

    if (filters.bathrooms) {
      filtered = filtered.filter((listing) => listing.bathrooms === Number.parseInt(filters.bathrooms))
    }

    // Area range
    filtered = filtered.filter(
      (listing) => listing.area >= filters.areaRange[0] && listing.area <= filters.areaRange[1],
    )

    if (filters.furnishing) {
      filtered = filtered.filter((listing) => listing.furnishing === filters.furnishing)
    }

    // Floor range
    filtered = filtered.filter(
      (listing) => listing.floor >= filters.floorRange[0] && listing.floor <= filters.floorRange[1],
    )

    if (filters.parking) {
      const hasParking = filters.parking === "Available"
      filtered = filtered.filter((listing) => listing.parking === hasParking)
    }

    if (filters.facing) {
      filtered = filtered.filter((listing) => listing.facing === filters.facing)
    }

    if (filters.propertyAge) {
      const maxAge = Number.parseInt(filters.propertyAge)
      filtered = filtered.filter((listing) => listing.propertyAge <= maxAge)
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((listing) => filters.amenities.every((amenity) => listing.amenities.includes(amenity)))
    }

    if (filters.ownerType) {
      filtered = filtered.filter((listing) => listing.ownerType === filters.ownerType)
    }

    if (filters.verified) {
      filtered = filtered.filter((listing) => listing.verified)
    }

    // Nearby stations filter
    if (filters.nearbyStations.length > 0) {
      filtered = filtered.filter((listing) => filters.nearbyStations.includes(listing.station))
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "price":
          aValue = a.priceNumeric
          bValue = b.priceNumeric
          break
        case "area":
          aValue = a.area
          bValue = b.area
          break
        case "date":
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredListings(filtered)
  }

  const handleSelectListing = (listingId: string) => {
    setSelectedListings((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId],
    )
  }

  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([])
    } else {
      setSelectedListings(filteredListings.map((listing) => listing.id))
    }
  }

  const handleWhatsAppSelected = () => {
    if (selectedListings.length === 0) {
      alert("Please select at least one listing")
      return
    }

    const selectedListingData = filteredListings.filter((listing) => selectedListings.includes(listing.id))
    const message = `Hi, I'm interested in the following properties:\n${selectedListingData
      .map((listing) => `- ${listing.title} (${listing.price})`)
      .join("\n")}`

    if (selectedListingData.length > 0) {
      const contact = selectedListingData[0].contact.replace(/[^0-9]/g, "")
      const whatsappUrl = `https://wa.me/${contact}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  const [showCompareModal, setShowCompareModal] = useState(false)
  const [compareListings, setCompareListings] = useState<Listing[]>([])

  const handleCompareSelected = () => {
    if (selectedListings.length < 2) {
      alert("Please select at least 2 listings to compare")
      return
    }
    setCompareListings(filteredListings.filter((l) => selectedListings.includes(l.id)))
    setShowCompareModal(true)
  }

  const handleWhatsApp = (contact: string, title: string) => {
    const message = `Hi, I'm interested in your property: ${title}`
    const whatsappUrl = `https://wa.me/${contact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const clearAllFilters = () => {
    setFilters({
      searchQuery: "",
      status: "",
      type: "",
      station: "",
      zone: "",
      minPrice: 0,
      maxPrice: 10000000,
      priceRange: [0, 10000000],
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      minArea: 0,
      maxArea: 5000,
      areaRange: [0, 5000],
      furnishing: "",
      nearbyStations: [],
      maxDistanceFromStation: 5,
      minFloor: 0,
      maxFloor: 50,
      floorRange: [0, 50],
      parking: "",
      facing: "",
      propertyAge: "",
      amenities: [],
      availableFrom: "",
      ownerType: "",
      verified: false,
      keywords: "",
      excludeKeywords: "",
    })
  }

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const toggleNearbyStation = (station: string) => {
    setFilters((prev) => ({
      ...prev,
      nearbyStations: prev.nearbyStations.includes(station)
        ? prev.nearbyStations.filter((s) => s !== station)
        : [...prev.nearbyStations, station],
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Type Tabs */}
        <Tabs value={activePropertyType} onValueChange={setActivePropertyType} className="mb-6">
          <TabsList className="grid grid-cols-8 w-full">
            {["Residential", "Commercial", "Shops", "Bunglow", "Raw House", "Villa", "Pent House", "Plot"].map(
              (type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-sm"
                >
                  {type}
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Advanced Filters</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Query */}
                <div className="space-y-2">
                  <Label>Search Properties</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by title, location, society..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Saved Searches */}
                {savedSearches.length > 0 && (
                  <div className="space-y-2">
                    <Label>Saved Searches</Label>
                    <div className="space-y-2">
                      {savedSearches.map((search) => (
                        <div key={search.id} className="flex items-center justify-between p-2 border rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadSavedSearch(search)}
                            className="flex-1 justify-start"
                          >
                            <Bookmark className="h-4 w-4 mr-2" />
                            {search.name}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteSavedSearch(search.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Filters */}
                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Status">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Property Type</Label>
                    <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Types">All Types</SelectItem>
                        <SelectItem value="rental">Rental</SelectItem>
                        <SelectItem value="resale">Resale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>BHK Type</Label>
                    <Select
                      value={filters.propertyType}
                      onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select BHK" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Types">All Types</SelectItem>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                      max={10000000}
                      min={0}
                      step={50000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>

                {/* Area Range */}
                <div className="space-y-3">
                  <Label>Area (sq ft)</Label>
                  <div className="px-2">
                    <Slider
                      value={filters.areaRange}
                      onValueChange={(value) => setFilters({ ...filters, areaRange: value })}
                      max={5000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{filters.areaRange[0]} sq ft</span>
                    <span>{filters.areaRange[1]} sq ft</span>
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full"
                >
                  {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                </Button>

                {showAdvancedFilters && (
                  <div className="space-y-4 border-t pt-4">
                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Bedrooms</Label>
                        <Select
                          value={filters.bedrooms}
                          onValueChange={(value) => setFilters({ ...filters, bedrooms: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Bathrooms</Label>
                        <Select
                          value={filters.bathrooms}
                          onValueChange={(value) => setFilters({ ...filters, bathrooms: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Furnishing */}
                    <div>
                      <Label>Furnishing</Label>
                      <Select
                        value={filters.furnishing}
                        onValueChange={(value) => setFilters({ ...filters, furnishing: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Any">Any</SelectItem>
                          {furnishingOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Floor Range */}
                    <div className="space-y-3">
                      <Label>Floor Range</Label>
                      <div className="px-2">
                        <Slider
                          value={filters.floorRange}
                          onValueChange={(value) => setFilters({ ...filters, floorRange: value })}
                          max={50}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Floor {filters.floorRange[0]}</span>
                        <span>Floor {filters.floorRange[1]}</span>
                      </div>
                    </div>

                    {/* Parking */}
                    <div>
                      <Label>Parking</Label>
                      <Select
                        value={filters.parking}
                        onValueChange={(value) => setFilters({ ...filters, parking: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Any">Any</SelectItem>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Not Available">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Facing */}
                    <div>
                      <Label>Facing</Label>
                      <Select
                        value={filters.facing}
                        onValueChange={(value) => setFilters({ ...filters, facing: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Any">Any</SelectItem>
                          {facingOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Property Age */}
                    <div>
                      <Label>Max Property Age (years)</Label>
                      <Select
                        value={filters.propertyAge}
                        onValueChange={(value) => setFilters({ ...filters, propertyAge: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Any">Any</SelectItem>
                          <SelectItem value="1">Under 1 year</SelectItem>
                          <SelectItem value="3">Under 3 years</SelectItem>
                          <SelectItem value="5">Under 5 years</SelectItem>
                          <SelectItem value="10">Under 10 years</SelectItem>
                          <SelectItem value="20">Under 20 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Owner Type */}
                    <div>
                      <Label>Owner Type</Label>
                      <Select
                        value={filters.ownerType}
                        onValueChange={(value) => setFilters({ ...filters, ownerType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Any">Any</SelectItem>
                          {ownerTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nearby Stations */}
                    <div>
                      <Label>Nearby Stations</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {stations.map((station) => (
                          <div key={station} className="flex items-center space-x-2">
                            <Checkbox
                              checked={filters.nearbyStations.includes(station)}
                              onCheckedChange={() => toggleNearbyStation(station)}
                            />
                            <span className="text-sm">{station}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                        {amenitiesList.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              checked={filters.amenities.includes(amenity)}
                              onCheckedChange={() => toggleAmenity(amenity)}
                            />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <Label>Include Keywords</Label>
                      <Input
                        placeholder="e.g., sea view, corner flat"
                        value={filters.keywords}
                        onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple keywords with commas</p>
                    </div>

                    {/* Exclude Keywords */}
                    <div>
                      <Label>Exclude Keywords</Label>
                      <Input
                        placeholder="e.g., ground floor, old building"
                        value={filters.excludeKeywords}
                        onChange={(e) => setFilters({ ...filters, excludeKeywords: e.target.value })}
                      />
                    </div>

                    {/* Verified Properties */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.verified}
                        onCheckedChange={(checked) => setFilters({ ...filters, verified: checked as boolean })}
                      />
                      <Label>Verified Properties Only</Label>
                    </div>
                  </div>
                )}

                {/* Save Search */}
                <Dialog open={showSaveSearch} onOpenChange={setShowSaveSearch}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Search
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Current Search</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Search Name</Label>
                        <Input
                          placeholder="e.g., 2BHK in Bandra under 50K"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowSaveSearch(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveCurrentSearch}>Save Search</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header with Results Count and Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold">{filteredListings.length} Properties Found</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>

                {/* View Mode Toggle */}
                <div className="flex border rounded">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Translate message in:" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="marathi">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleWhatsAppSelected} className="bg-orange-600 hover:bg-orange-700">
                  WhatsApp Selected ({selectedListings.length})
                </Button>
                <Button
                  onClick={handleCompareSelected}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  Compare Selected ({selectedListings.length})
                </Button>
              </div>
            </div>

            {/* Listings */}
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No properties found</p>
                <p className="text-gray-400">Try adjusting your filters to see more results</p>
                <Button onClick={clearAllFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedListings.includes(listing.id)}
                            onCheckedChange={() => handleSelectListing(listing.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                              <Badge variant={listing.type === "rental" ? "default" : "secondary"}>
                                {listing.type}
                              </Badge>
                              <Badge variant={listing.status === "Active" ? "default" : "outline"}>
                                {listing.status}
                              </Badge>
                              {listing.verified && (
                                <Badge className="bg-green-600 text-white">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span>{listing.location}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Home className="h-4 w-4" />
                                <span>{listing.propertyType}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Building className="h-4 w-4" />
                                <span>{listing.area} sq ft</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>
                                  Floor {listing.floor}/{listing.totalFloors}
                                </span>
                              </div>
                              {listing.parking && (
                                <div className="flex items-center space-x-1">
                                  <Car className="h-4 w-4" />
                                  <span>Parking</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{listing.contact}</span>
                              </div>
                              <span>{listing.ownerType}</span>
                              <span>{listing.furnishing}</span>
                            </div>
                            {listing.amenities.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {listing.amenities.slice(0, 3).map((amenity) => (
                                  <Badge key={amenity} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {listing.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{listing.amenities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-orange-600">{listing.price}</p>
                            <p className="text-sm text-gray-500">Listed on {listing.createdAt}</p>
                            <p className="text-xs text-gray-400">{listing.availability}</p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleWhatsApp(listing.contact, listing.title)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Compare Listings Modal */}
            {showCompareModal && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full overflow-x-auto">
                  <h2 className="text-2xl font-bold mb-4">Compare Listings</h2>
                  <div className="flex space-x-8">
                    {compareListings.map((listing) => (
                      <div key={listing.id} className="border p-4 rounded w-72">
                        <h3 className="font-bold text-lg mb-2">{listing.title}</h3>
                        {Object.entries(listing).map(([key, value]) => (
                          <p key={key}>
                            <b>{key}:</b> {String(value)}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <Button
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                    onClick={() => setShowCompareModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
