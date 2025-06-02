import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (cron job)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "your-secret-key"

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")

    // Get all active alerts
    const alerts = await db.collection("property_alerts").find({ isActive: true }).toArray()
    let notificationsSent = 0

    for (const alert of alerts) {
      const matches = await checkAlertForNewMatches(alert, db)
      if (matches > 0) {
        notificationsSent += matches
      }
    }

    await client.close()

    return NextResponse.json({
      success: true,
      alertsChecked: alerts.length,
      notificationsSent,
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function checkAlertForNewMatches(alert: any, db: any): Promise<number> {
  try {
    // Build search criteria for new properties
    const searchCriteria: any = { approved: true }

    // Only check properties created in the last hour (for hourly cron)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    searchCriteria.createdAt = { $gte: oneHourAgo }

    // Apply alert criteria
    if (alert.criteria.type && alert.criteria.type !== "any") {
      searchCriteria.type = alert.criteria.type
    }

    if (alert.criteria.location) {
      searchCriteria.location = { $regex: alert.criteria.location, $options: "i" }
    }

    if (alert.criteria.propertyType && alert.criteria.propertyType !== "any") {
      searchCriteria.propertyType = alert.criteria.propertyType
    }

    // Price range
    if (alert.criteria.minPrice > 0 || alert.criteria.maxPrice < 10000000) {
      searchCriteria.priceNumeric = {
        $gte: alert.criteria.minPrice,
        $lte: alert.criteria.maxPrice,
      }
    }

    // Area range
    if (alert.criteria.minArea > 0 || alert.criteria.maxArea < 5000) {
      searchCriteria.area = {
        $gte: alert.criteria.minArea,
        $lte: alert.criteria.maxArea,
      }
    }

    // Keywords
    if (alert.criteria.keywords) {
      const keywords = alert.criteria.keywords.split(",").map((k: string) => k.trim())
      searchCriteria.$or = keywords.map((keyword) => ({
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { amenities: { $regex: keyword, $options: "i" } },
        ],
      }))
    }

    // Search both collections
    const rentalMatches = await db.collection("rental_listings").find(searchCriteria).toArray()
    const resaleMatches = await db.collection("resale_listings").find(searchCriteria).toArray()
    const allMatches = [...rentalMatches, ...resaleMatches]

    if (allMatches.length > 0) {
      // Check if we should send notification based on frequency
      const shouldNotify = shouldSendNotification(alert)

      if (shouldNotify) {
        await sendAlertNotifications(alert, allMatches, db)

        // Update last triggered time
        await db.collection("property_alerts").updateOne(
          { _id: alert._id },
          {
            $set: {
              lastTriggered: new Date(),
              matchCount: alert.matchCount + allMatches.length,
            },
          },
        )

        return allMatches.length
      }
    }

    return 0
  } catch (error) {
    console.error("Error checking alert:", error)
    return 0
  }
}

function shouldSendNotification(alert: any): boolean {
  const now = new Date()
  const lastTriggered = alert.lastTriggered ? new Date(alert.lastTriggered) : null

  if (!lastTriggered) {
    return true // First time
  }

  const timeDiff = now.getTime() - lastTriggered.getTime()

  switch (alert.frequency) {
    case "instant":
      return true
    case "daily":
      return timeDiff >= 24 * 60 * 60 * 1000 // 24 hours
    case "weekly":
      return timeDiff >= 7 * 24 * 60 * 60 * 1000 // 7 days
    default:
      return false
  }
}

async function sendAlertNotifications(alert: any, matches: any[], db: any) {
  // Limit to top 3 matches to avoid spam
  const topMatches = matches.slice(0, 3)

  for (const match of topMatches) {
    // Create notification record
    const notification = {
      alertId: alert._id,
      userId: alert.userId,
      alertName: alert.name,
      propertyId: match._id,
      propertyTitle: match.title || match.buildingSociety,
      propertyLocation: match.location,
      propertyPrice: match.price || match.rent || match.expectedPrice,
      propertyType: match.propertyType || match.type,
      matchReason: "New property matches your search criteria",
      sentAt: new Date(),
      channels: [],
      status: "sent",
    }

    // Send notifications based on preferences
    if (alert.emailEnabled) {
      // Send email notification
      notification.channels.push("email")
    }

    if (alert.smsEnabled) {
      // Send SMS notification
      notification.channels.push("sms")
    }

    if (alert.whatsappEnabled) {
      // Send WhatsApp notification
      notification.channels.push("whatsapp")
    }

    // Save notification record
    await db.collection("alert_notifications").insertOne(notification)
  }
}
