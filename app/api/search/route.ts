import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const location = searchParams.get("location") || ""
    const type = searchParams.get("type") || ""
    const propertyType = searchParams.get("propertyType") || ""
    const minPrice = searchParams.get("minPrice") || "0"
    const maxPrice = searchParams.get("maxPrice") || "10000000"

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")

    // Build search criteria
    const searchCriteria: any = { approved: true }

    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { buildingSociety: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { amenities: { $regex: query, $options: "i" } },
      ]
    }

    if (location) {
      searchCriteria.location = { $regex: location, $options: "i" }
    }

    if (type) {
      searchCriteria.type = type
    }

    if (propertyType) {
      searchCriteria.propertyType = propertyType
    }

    // Price range filter
    const minPriceNum = Number.parseInt(minPrice)
    const maxPriceNum = Number.parseInt(maxPrice)
    if (minPriceNum > 0 || maxPriceNum < 10000000) {
      searchCriteria.priceNumeric = {
        $gte: minPriceNum,
        $lte: maxPriceNum,
      }
    }

    // Search in both collections
    const rentalResults = await db.collection("rental_listings").find(searchCriteria).toArray()
    const resaleResults = await db.collection("resale_listings").find(searchCriteria).toArray()

    // Combine and format results
    const allResults = [
      ...rentalResults.map((listing) => ({ ...listing, type: "rental" })),
      ...resaleResults.map((listing) => ({ ...listing, type: "resale" })),
    ]

    // Remove flatNo for search results (as per CP dashboard requirements)
    const filteredResults = allResults.map((listing) => {
      const { flatNo, ...rest } = listing
      return {
        ...rest,
        priceNumeric: extractNumericPrice(listing.price || listing.rent || listing.expectedPrice),
        amenities: listing.amenities ? listing.amenities.split(",").map((a: string) => a.trim()) : [],
        images: listing.images || [],
        verified: Math.random() > 0.3, // Mock verification status
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3-5
        reviews: Math.floor(Math.random() * 50) + 5, // Random review count
      }
    })

    await client.close()

    return NextResponse.json(filteredResults)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function extractNumericPrice(priceString: string): number {
  if (!priceString) return 0

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
