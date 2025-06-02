import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")

    // Get only approved listings for CP dashboard
    const rentalListings = await db.collection("rental_listings").find({ approved: true }).toArray()
    const resaleListings = await db.collection("resale_listings").find({ approved: true }).toArray()

    // Remove flatNo from all listings for CP dashboard as per requirements
    const filteredRentalListings = rentalListings.map((listing) => {
      const { flatNo, ...rest } = listing
      return rest
    })

    const filteredResaleListings = resaleListings.map((listing) => {
      const { flatNo, ...rest } = listing
      return rest
    })

    const allListings = [
      ...filteredRentalListings.map((listing) => ({ ...listing, type: "rental" })),
      ...filteredResaleListings.map((listing) => ({ ...listing, type: "resale" })),
    ]

    await client.close()

    return NextResponse.json(allListings)
  } catch (error) {
    console.error("Error fetching CP listings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
