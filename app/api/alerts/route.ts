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
    const alerts = db.collection("property_alerts")

    // Get user's alerts
    const userAlerts = await alerts.find({ userId: new ObjectId(decoded.userId) }).toArray()

    await client.close()

    return NextResponse.json(userAlerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
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
    const alerts = db.collection("property_alerts")

    // Create new alert
    const alert = {
      ...body,
      userId: new ObjectId(decoded.userId),
      isActive: true,
      matchCount: 0,
      lastTriggered: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await alerts.insertOne(alert)

    // Trigger immediate check for matching properties
    await checkForMatches(result.insertedId, alert, db)

    await client.close()

    return NextResponse.json({ id: result.insertedId, ...alert })
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function checkForMatches(alertId: ObjectId, alert: any, db: any) {
  try {
    // Build search criteria based on alert criteria
    const searchCriteria: any = { approved: true }

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

    // Search in both collections
    const rentalMatches = await db.collection("rental_listings").find(searchCriteria).toArray()
    const resaleMatches = await db.collection("resale_listings").find(searchCriteria).toArray()

    const allMatches = [...rentalMatches, ...resaleMatches]

    // Update match count
    await db.collection("property_alerts").updateOne(
      { _id: alertId },
      {
        $set: {
          matchCount: allMatches.length,
          lastTriggered: new Date(),
        },
      },
    )

    // Send notifications for new matches
    if (allMatches.length > 0) {
      await sendNotifications(alertId, alert, allMatches, db)
    }
  } catch (error) {
    console.error("Error checking for matches:", error)
  }
}

async function sendNotifications(alertId: ObjectId, alert: any, matches: any[], db: any) {
  try {
    const notifications = db.collection("alert_notifications")

    for (const match of matches.slice(0, 5)) {
      // Limit to 5 notifications per alert
      const notification = {
        alertId,
        userId: alert.userId,
        alertName: alert.name,
        propertyId: match._id,
        propertyTitle: match.title || match.buildingSociety,
        propertyLocation: match.location,
        propertyPrice: match.price || match.rent || match.expectedPrice,
        propertyType: match.propertyType || match.type,
        matchReason: "Matches your search criteria",
        sentAt: new Date(),
        channels: [],
        status: "pending",
      }

      // Send email notification
      if (alert.emailEnabled) {
        await sendEmailNotification(alert, match)
        notification.channels.push("email")
      }

      // Send SMS notification
      if (alert.smsEnabled) {
        await sendSMSNotification(alert, match)
        notification.channels.push("sms")
      }

      // Send WhatsApp notification
      if (alert.whatsappEnabled) {
        await sendWhatsAppNotification(alert, match)
        notification.channels.push("whatsapp")
      }

      notification.status = "sent"
      await notifications.insertOne(notification)
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}

async function sendEmailNotification(alert: any, property: any) {
  // Email notification logic would go here
  // For demo purposes, we'll just log
  console.log(`Email notification sent for alert: ${alert.name}`)
  console.log(`Property: ${property.title || property.buildingSociety}`)
}

async function sendSMSNotification(alert: any, property: any) {
  // SMS notification logic would go here
  // Integration with SMS service like Twilio
  console.log(`SMS notification sent for alert: ${alert.name}`)
  console.log(`Property: ${property.title || property.buildingSociety}`)
}

async function sendWhatsAppNotification(alert: any, property: any) {
  // WhatsApp notification logic would go here
  // Integration with WhatsApp Business API
  console.log(`WhatsApp notification sent for alert: ${alert.name}`)
  console.log(`Property: ${property.title || property.buildingSociety}`)
}
