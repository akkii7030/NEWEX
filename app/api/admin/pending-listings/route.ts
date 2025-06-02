import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""
const JWT_SECRET = process.env.JWT_SECRET || "estatex"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")

    // Get all pending listings
    const rentalListings = await db.collection("rental_listings").find({ approved: false }).toArray()
    const resaleListings = await db.collection("resale_listings").find({ approved: false }).toArray()

    const allPendingListings = [
      ...rentalListings.map((listing) => ({ ...listing, type: "rental" })),
      ...resaleListings.map((listing) => ({ ...listing, type: "resale" })),
    ]

    await client.close()

    return NextResponse.json(allPendingListings)
  } catch (error) {
    console.error("Error fetching pending listings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
