import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { MongoClient, ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""
const JWT_SECRET = process.env.JWT_SECRET || "estatex"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const body = await request.json()
    const alertId = params.id

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")
    const alerts = db.collection("property_alerts")

    // Toggle alert status
    const result = await alerts.updateOne(
      { _id: new ObjectId(alertId), userId: new ObjectId(decoded.userId) },
      {
        $set: {
          isActive: body.isActive,
          updatedAt: new Date(),
        },
      },
    )

    await client.close()

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling alert:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
