import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""
const JWT_SECRET = process.env.JWT_SECRET || "estatex"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const body = await request.json()

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")
    const resaleListings = db.collection("resale_listings")

    // Create resale listing with approval status
    const listing = {
      ...body,
      userId: new ObjectId(decoded.userId),
      approved: false, // All listings need admin approval
      status: "Pending Approval",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await resaleListings.insertOne(listing)
    await client.close()

    return NextResponse.json({ id: result.insertedId, ...listing })
  } catch (error) {
    console.error("Error creating resale listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
