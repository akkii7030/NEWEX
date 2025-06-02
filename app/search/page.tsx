"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  MapPin,
  Home,
  Building,
  Car,
  Shield,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Eye,
  MessageCircle,
  Star,
} from "lucide-react"
import Navbar from "@/components/navbar"

interface SearchResult {
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
  rating: number
  reviews: number
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState("relevance")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [searchFilters, setSearchFilters] = useState({
    query: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    minPrice: 0,
    maxPrice: 10000000,
    priceRange: [0, 10000000],
    propertyType: searchParams.get("propertyType") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    minArea: 0,
    maxArea: 5000,
    areaRange: [0, 5000],
    furnishing: "",
    amenities: [] as string[],
    verified: false,
    rating: 0,
  })

  const propertyTypes = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "Villa", "Penthouse", "Studio", "Duplex"]
  const furnishingOptions = ["Fully Furnished", "Semi Furnished", "Unfurnished"]
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
    performSearch()
  }, [searchParams])

  useEffect(() => {
    applyFilters()
  }, [searchFilters, searchResults, sortBy, sortOrder])

  const performSearch = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchFilters.query) queryParams.append("q", searchFilters.query)
      if (searchFilters.location) queryParams.append("location", searchFilters.location)
      if (searchFilters.type) queryParams.append("type", searchFilters.type)
      if (searchFilters.propertyType) queryParams.append("propertyType", searchFilters.propertyType)

      const response = await fetch(`/api/search?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Search error:", error)
      // Mock search results for demo
      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "rental",
          title: "Luxury 2BHK with Sea View in Bandra",
          location: "Bandra West, Mumbai",
          price: "₹65,000/month",
          priceNumeric: 65000,
          status: "Active",
          contact: "+91 9876543210",
          email: "owner1@example.com",
          createdAt: "2024-01-15",
          zone: "West",
          station: "Bandra",
          buildingSociety: "Sea Breeze Apartments",
          propertyType: "2BHK",
          bedrooms: 2,
          bathrooms: 2,
          area: 1100,
          furnishing: "Fully Furnished",
          parking: true,
          amenities: ["Swimming Pool", "Gym", "Security", "Sea View", "Club House"],
          propertyAge: 3,
          floor: 15,
          totalFloors: 25,
          facing: "West",
          availability: "Immediate",
          images: ["/placeholder.svg?height=200&width=300"],
          description: "Stunning 2BHK apartment with panoramic sea view, modern amenities and prime location",
          ownerType: "Owner",
          verified: true,
          rating: 4.8,
          reviews: 24,
        },
        {
          id: "2",
          type: "resale",
          title: "Premium 3BHK Penthouse in Powai",
          location: "Powai, Mumbai",
          price: "₹2.5 Cr",
          priceNumeric: 25000000,
          status: "Active",
          contact: "+91 9876543211",
          email: "owner2@example.com",
          createdAt: "2024-01-10",
          zone: "Central",
          station: "Powai",
          buildingSociety: "Skyline Towers",
          propertyType: "3BHK",
          bedrooms: 3,
          bathrooms: 4,
          area: 1800,
          furnishing: "Fully Furnished",
          parking: true,
          amenities: ["Swimming Pool", "Gym", "Security", "Terrace Garden", "Home Theater"],
          propertyAge: 1,
          floor: 28,
          totalFloors: 30,
          facing: "North",
          availability: "Ready to Move",
          images: ["/placeholder.svg?height=200&width=300"],
          description: "Exclusive penthouse with private terrace, premium fittings and breathtaking city views",
          ownerType: "Builder",
          verified: true,
          rating: 4.9,
          reviews: 18,
        },
        {
          id: "3",
          type: "rental",
          title: "Cozy 1BHK Near Metro Station",
          location: "Andheri East, Mumbai",
          price: "₹32,000/month",
          priceNumeric: 32000,
          status: "Active",
          contact: "+91 9876543212",
          email: "owner3@example.com",
          createdAt: "2024-01-12",
          zone: "West",
          station: "Andheri",
          buildingSociety: "Metro View Residency",
          propertyType: "1BHK",
          bedrooms: 1,
          bathrooms: 1,
          area: 550,
          furnishing: "Semi Furnished",
          parking: false,
          amenities: ["Security", "Lift", "Power Backup", "Water Supply"],
          propertyAge: 6,
          floor: 7,
          totalFloors: 12,
          facing: "East",
          availability: "15 Days",
          images: ["/placeholder.svg?height=200&width=300"],
          description: "Well-maintained 1BHK apartment with easy metro connectivity and modern amenities",
          ownerType: "Owner",
          verified: false,
          rating: 4.2,
          reviews: 12,
        },
      ]
      setSearchResults(mockResults)
    }
    setIsLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...searchResults]

    // Apply filters
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase()
      filtered = filtered.filter(
        (result) =>
          result.title.toLowerCase().includes(query) ||
          result.location.toLowerCase().includes(query) ||
          result.description.toLowerCase().includes(query),
      )
    }

    if (searchFilters.location) {
      filtered = filtered.filter((result) =>
        result.location.toLowerCase().includes(searchFilters.location.toLowerCase()),
      )
    }

    if (searchFilters.type) {
      filtered = filtered.filter((result) => result.type === searchFilters.type)
    }

    if (searchFilters.propertyType) {
      filtered = filtered.filter((result) => result.propertyType === searchFilters.propertyType)
    }

    if (searchFilters.bedrooms) {
      filtered = filtered.filter((result) => result.bedrooms === Number.parseInt(searchFilters.bedrooms))
    }

    // Price range
    filtered = filtered.filter(
      (result) =>
        result.priceNumeric >= searchFilters.priceRange[0] && result.priceNumeric <= searchFilters.priceRange[1],
    )

    // Area range
    filtered = filtered.filter(
      (result) => result.area >= searchFilters.areaRange[0] && result.area <= searchFilters.areaRange[1],
    )

    if (searchFilters.furnishing) {
      filtered = filtered.filter((result) => result.furnishing === searchFilters.furnishing)
    }

    if (searchFilters.amenities.length > 0) {
      filtered = filtered.filter((result) =>
        searchFilters.amenities.every((amenity) => result.amenities.includes(amenity)),
      )
    }

    if (searchFilters.verified) {
      filtered = filtered.filter((result) => result.verified)
    }

    if (searchFilters.rating > 0) {
      filtered = filtered.filter((result) => result.rating >= searchFilters.rating)
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
        case "rating":
          aValue = a.rating
          bValue = b.rating
          break
        case "date":
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case "relevance":
        default:
          // For relevance, prioritize verified properties and higher ratings
          aValue = (a.verified ? 1000 : 0) + a.rating * 100
          bValue = (b.verified ? 1000 : 0) + b.rating * 100
          break
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredResults(filtered)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchFilters.query) params.append("q", searchFilters.query)
    if (searchFilters.location) params.append("location", searchFilters.location)
    if (searchFilters.type) params.append("type", searchFilters.type)
    if (searchFilters.propertyType) params.append("propertyType", searchFilters.propertyType)

    router.push(`/search?${params.toString()}`)
  }

  const toggleAmenity = (amenity: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search properties, locations, or keywords..."
                value={searchFilters.query}
                onChange={(e) => setSearchFilters({ ...searchFilters, query: e.target.value })}
                className="pl-10 h-12 text-lg"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={searchFilters.location}
                onValueChange={(value) => setSearchFilters({ ...searchFilters, location: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="bandra">Bandra</SelectItem>
                  <SelectItem value="andheri">Andheri</SelectItem>
                  <SelectItem value="powai">Powai</SelectItem>
                  <SelectItem value="kandivali">Kandivali</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="bg-orange-600 hover:bg-orange-700 h-12 px-8">
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Refine Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Type */}
                <div>
                  <Label>Property Type</Label>
                  <Select
                    value={searchFilters.type}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, type: value })}
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

                {/* BHK Type */}
                <div>
                  <Label>BHK Type</Label>
                  <Select
                    value={searchFilters.propertyType}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, propertyType: value })}
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

                {/* Bedrooms */}
                <div>
                  <Label>Bedrooms</Label>
                  <Select
                    value={searchFilters.bedrooms}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, bedrooms: value })}
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

                {/* Price Range */}
                <div className="space-y-3">
                  <Label>Price Range</Label>
                  <div className="px-2">
                    <Slider
                      value={searchFilters.priceRange}
                      onValueChange={(value) => setSearchFilters({ ...searchFilters, priceRange: value })}
                      max={10000000}
                      min={0}
                      step={50000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(searchFilters.priceRange[0])}</span>
                    <span>{formatPrice(searchFilters.priceRange[1])}</span>
                  </div>
                </div>

                {/* Area Range */}
                <div className="space-y-3">
                  <Label>Area (sq ft)</Label>
                  <div className="px-2">
                    <Slider
                      value={searchFilters.areaRange}
                      onValueChange={(value) => setSearchFilters({ ...searchFilters, areaRange: value })}
                      max={5000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{searchFilters.areaRange[0]} sq ft</span>
                    <span>{searchFilters.areaRange[1]} sq ft</span>
                  </div>
                </div>

                {/* Furnishing */}
                <div>
                  <Label>Furnishing</Label>
                  <Select
                    value={searchFilters.furnishing}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, furnishing: value })}
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

                {/* Amenities */}
                <div>
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          checked={searchFilters.amenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <Label>Minimum Rating</Label>
                  <Select
                    value={searchFilters.rating.toString()}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, rating: Number.parseFloat(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Verified Properties */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={searchFilters.verified}
                    onCheckedChange={(checked) => setSearchFilters({ ...searchFilters, verified: checked as boolean })}
                  />
                  <Label>Verified Properties Only</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading ? "Searching..." : `${filteredResults.length} Properties Found`}
                </h2>
                {searchFilters.query && <p className="text-gray-600">Results for "{searchFilters.query}"</p>}
              </div>

              <div className="flex items-center space-x-3">
                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
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

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Searching properties...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && filteredResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button
                  onClick={() =>
                    setSearchFilters({ ...searchFilters, query: "", location: "", type: "", propertyType: "" })
                  }
                >
                  Clear Search
                </Button>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && filteredResults.length > 0 && (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-6"}>
                {filteredResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Property Image */}
                        <div className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                          <img
                            src={result.images[0] || "/placeholder.svg?height=96&width=128"}
                            alt={result.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Property Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600">
                                  {result.title}
                                </h3>
                                <Badge variant={result.type === "rental" ? "default" : "secondary"}>
                                  {result.type}
                                </Badge>
                                {result.verified && (
                                  <Badge className="bg-green-600 text-white">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 text-gray-600 mb-2">
                                <MapPin className="h-4 w-4" />
                                <span>{result.location}</span>
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center space-x-1">
                                  <Home className="h-4 w-4" />
                                  <span>{result.propertyType}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Building className="h-4 w-4" />
                                  <span>{result.area} sq ft</span>
                                </div>
                                <span>
                                  Floor {result.floor}/{result.totalFloors}
                                </span>
                                {result.parking && (
                                  <div className="flex items-center space-x-1">
                                    <Car className="h-4 w-4" />
                                    <span>Parking</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex items-center">{renderStars(result.rating)}</div>
                                <span className="text-sm text-gray-600">
                                  {result.rating} ({result.reviews} reviews)
                                </span>
                              </div>

                              <p className="text-sm text-gray-600 line-clamp-2">{result.description}</p>

                              {result.amenities.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {result.amenities.slice(0, 3).map((amenity) => (
                                    <Badge key={amenity} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {result.amenities.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{result.amenities.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Price and Actions */}
                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-600 mb-2">{result.price}</p>
                              <p className="text-sm text-gray-500 mb-2">{result.ownerType}</p>
                              <p className="text-xs text-gray-400 mb-4">{result.availability}</p>

                              <div className="flex flex-col space-y-2">
                                <Button size="sm" variant="outline" className="w-full">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const message = `Hi, I'm interested in your property: ${result.title}`
                                    const whatsappUrl = `https://wa.me/${result.contact.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
                                    window.open(whatsappUrl, "_blank")
                                  }}
                                  className="bg-green-600 hover:bg-green-700 w-full"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  WhatsApp
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!isLoading && filteredResults.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="px-8">
                  Load More Properties
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
