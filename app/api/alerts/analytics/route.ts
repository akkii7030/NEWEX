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

    // Get analytics data
    const analytics = await getAlertAnalytics(decoded.userId, db)

    await client.close()

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getAlertAnalytics(userId: string, db: any) {
  const userObjectId = new ObjectId(userId)

  // Get alert statistics
  const alertStats = await db
    .collection("property_alerts")
    .aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalAlerts: { $sum: 1 },
          activeAlerts: { $sum: { $cond: ["$isActive", 1, 0] } },
          totalMatches: { $sum: "$matchCount" },
          avgMatchesPerAlert: { $avg: "$matchCount" },
        },
      },
    ])
    .toArray()

  // Get notification statistics
  const notificationStats = await db
    .collection("alert_notifications")
    .aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          emailNotifications: {
            $sum: { $cond: [{ $in: ["email", "$channels"] }, 1, 0] },
          },
          smsNotifications: {
            $sum: { $cond: [{ $in: ["sms", "$channels"] }, 1, 0] },
          },
          whatsappNotifications: {
            $sum: { $cond: [{ $in: ["whatsapp", "$channels"] }, 1, 0] },
          },
        },
      },
    ])
    .toArray()

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentActivity = await db
    .collection("alert_notifications")
    .aggregate([
      {
        $match: {
          userId: userObjectId,
          sentAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$sentAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  // Get top performing alerts
  const topAlerts = await db
    .collection("property_alerts")
    .aggregate([
      { $match: { userId: userObjectId } },
      { $sort: { matchCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          matchCount: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
    ])
    .toArray()

  // Get alert frequency distribution
  const frequencyDistribution = await db
    .collection("property_alerts")
    .aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$frequency",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray()

  return {
    alertStats: alertStats[0] || {
      totalAlerts: 0,
      activeAlerts: 0,
      totalMatches: 0,
      avgMatchesPerAlert: 0,
    },
    notificationStats: notificationStats[0] || {
      totalNotifications: 0,
      emailNotifications: 0,
      smsNotifications: 0,
      whatsappNotifications: 0,
    },
    recentActivity,
    topAlerts,
    frequencyDistribution,
  }
}
