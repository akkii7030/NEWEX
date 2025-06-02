import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""
const JWT_SECRET = process.env.JWT_SECRET || "estatex"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")

    // Get user's listings (including flatNo for My Inventories as per requirements)
    const rentalListings = await db
      .collection("rental_listings")
      .find({ userId: new ObjectId(decoded.userId) })
      .toArray()

    const resaleListings = await db
      .collection("resale_listings")
      .find({ userId: new ObjectId(decoded.userId) })
      .toArray()

    await client.close()

    return NextResponse.json({
      rental: rentalListings,
      resale: resaleListings,
    })
  } catch (error) {
    console.error("Error fetching user listings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
