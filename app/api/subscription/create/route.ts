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
    const { locations, totalAmount } = body

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")
    const subscriptions = db.collection("subscriptions")
    const users = db.collection("users")

    // Create subscription record
    const subscription = {
      userId: new ObjectId(decoded.userId),
      locations,
      totalAmount,
      status: "active", // In real app, this would be "pending" until payment confirmation
      paymentMethod: "razorpay",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }

    await subscriptions.insertOne(subscription)

    // Update user subscription status
    await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          isSubscribed: true,
          subscribedLocations: locations,
          subscriptionUpdatedAt: new Date(),
        },
      },
    )

    await client.close()

    return NextResponse.json({ success: true, subscriptionId: subscription })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
