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
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")
    const notifications = db.collection("alert_notifications")

    // Get user's notifications with pagination
    const userNotifications = await notifications
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalCount = await notifications.countDocuments({ userId: new ObjectId(decoded.userId) })

    await client.close()

    return NextResponse.json({
      notifications: userNotifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const notifications = db.collection("alert_notifications")

    // Mark notifications as read
    if (body.action === "markAsRead") {
      const result = await notifications.updateMany(
        {
          userId: new ObjectId(decoded.userId),
          _id: { $in: body.notificationIds.map((id: string) => new ObjectId(id)) },
        },
        { $set: { read: true, readAt: new Date() } },
      )

      await client.close()
      return NextResponse.json({ success: true, updated: result.modifiedCount })
    }

    // Mark all notifications as read
    if (body.action === "markAllAsRead") {
      const result = await notifications.updateMany(
        { userId: new ObjectId(decoded.userId), read: { $ne: true } },
        { $set: { read: true, readAt: new Date() } },
      )

      await client.close()
      return NextResponse.json({ success: true, updated: result.modifiedCount })
    }

    await client.close()
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
