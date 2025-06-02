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
  approved: boolean
  ownerId?: string
  flatNumber?: string
  contactName?: string
  deposit?: string
  directOrBroker?: string
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

    // New fields
    prefix: "",
    name: "",
    whatsapp: "",
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

    // Only show approved listings in CP Dashboard
    filtered = filtered.filter((listing) => listing.approved === true)

    // Filter by type (rental/resale)
    if (filters.status) {
      filtered = filtered.filter((listing) => listing.type === filters.status)
    }

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

  const [maxCompare, setMaxCompare] = useState(8);

  useEffect(() => {
    const updateMaxCompare = () => {
      setMaxCompare(window.innerWidth < 768 ? 5 : 8);
    };
    updateMaxCompare();
    window.addEventListener("resize", updateMaxCompare);
    return () => window.removeEventListener("resize", updateMaxCompare);
  }, []);

  const handleSelectListing = (listingId: string) => {
    if (
      selectedListings.includes(listingId)
        ? false
        : selectedListings.length >= maxCompare
    ) {
      alert(`You can compare up to ${maxCompare} listings at a time.`);
      return;
    }
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
      prefix: "",
      name: "",
      whatsapp: "",
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

  // Add this helper for "Coming Soon" alert
  const handleComingSoon = () => {
    alert("Coming Soon");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Type Tabs */}
        <Tabs value={activePropertyType} onValueChange={setActivePropertyType} className="mb-2">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger
              value="Residential"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-sm"
            >
              Residential
            </TabsTrigger>
            {["Commercial", "Shops", "Bunglow", "Raw House", "Villa", "Pent House", "Plot"].map((type) => (
              <div key={type} className="relative group">
                <button
                  type="button"
                  className="text-sm text-gray-400 cursor-not-allowed px-2 py-1 w-full"
                  onClick={handleComingSoon}
                  tabIndex={-1}
                  style={{ pointerEvents: "auto" }}
                >
                  {type}
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 z-10 hidden group-hover:block bg-orange-600 text-white text-xs rounded px-2 py-1 shadow">
                  Coming Soon
                </div>
              </div>
            ))}
          </TabsList>
        </Tabs>

        {/* Status Filter just below Tabs */}
        <div className="mb-6 flex items-center space-x-4">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resale">Resale</SelectItem>
              <SelectItem value="rental">Rental</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                {/* Prefix */}
                <div>
                  <Label>Prefix</Label>
                  <Select
                    value={filters.prefix || ""}
                    onValueChange={(value) => setFilters({ ...filters, prefix: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Prefix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="Enter name"
                    value={filters.name || ""}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <Label>WhatsApp Number</Label>
                  <Input
                    placeholder="Enter WhatsApp number"
                    value={filters.whatsapp || ""}
                    onChange={(e) => setFilters({ ...filters, whatsapp: e.target.value })}
                  />
                </div>

                {/* Type */}
                <div>
                  <Label>Type</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value, station: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resale">Resale</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Station */}
                <div>
                  <Label>Station</Label>
                  <Select
                    value={filters.station}
                    onValueChange={(value) => setFilters({ ...filters, station: value })}
                    disabled={!filters.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status first" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Budget */}
                <div>
                  <Label>Min Budget</Label>
                  <Input
                    type="number"
                    placeholder="Enter min budget"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                  />
                </div>

                {/* Max Budget */}
                <div>
                  <Label>Max Budget</Label>
                  <Input
                    type="number"
                    placeholder="Enter max budget"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                  />
                </div>

                {/* Apply Filters Button */}
                <Button className="w-full" onClick={applyFilters}>
                  Apply Filters
                </Button>
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
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Select</th>
                      <th>Direct / Broker</th>
                      <th>Building / Society name</th>
                      <th>Road / Location</th>
                      {filters.status === "resale" && (
                        <>
                          <th>Expected Price</th>
                          <th>FLR NO</th>
                        </>
                      )}
                      {filters.status === "rental" && (
                        <>
                          <th>Rent</th>
                          <th>Deposit</th>
                        </>
                      )}
                      <th>Flat No.</th>
                      <th>Name - No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((listing, idx) => {
                      const isAdmin = user?.role === "admin";
                      const isOwnListing = user?.id === listing.ownerId;
                      return (
                        <tr key={listing.id}>
                          <td>{idx + 1}</td>
                          <td>
                            <Checkbox
                              checked={selectedListings.includes(listing.id)}
                              onCheckedChange={() => handleSelectListing(listing.id)}
                            />
                          </td>
                          <td>{listing.directOrBroker}</td>
                          <td>{listing.buildingSociety}</td>
                          <td>{listing.location}</td>
                          {filters.status === "resale" && (
                            <>
                              <td>{listing.price}</td>
                              <td>{listing.floor}</td>
                            </>
                          )}
                          {filters.status === "rental" && (
                            <>
                              <td>{listing.price}</td>
                              <td>{listing.deposit}</td>
                            </>
                          )}
                          <td>{(isAdmin || isOwnListing) ? listing.flatNumber : "****"}</td>
                          <td>{listing.contactName} - {listing.contact}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
