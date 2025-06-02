import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""

// Webhook endpoint for real-time property matching
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, propertyData, action } = body

    if (action !== "property_created" && action !== "property_updated") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")

    // Find matching alerts
    const matchingAlerts = await findMatchingAlerts(propertyData, db)

    // Send notifications for matching alerts
    for (const alert of matchingAlerts) {
      await processAlertMatch(alert, propertyData, db)
    }

    await client.close()

    return NextResponse.json({
      success: true,
      matchingAlerts: matchingAlerts.length,
      message: `Processed ${matchingAlerts.length} matching alerts`,
    })
  } catch (error) {
    console.error("Error processing property match webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function findMatchingAlerts(propertyData: any, db: any) {
  const alerts = db.collection("property_alerts")

  // Get all active alerts
  const activeAlerts = await alerts.find({ isActive: true }).toArray()

  const matchingAlerts = []

  for (const alert of activeAlerts) {
    if (doesPropertyMatchAlert(propertyData, alert.criteria)) {
      matchingAlerts.push(alert)
    }
  }

  return matchingAlerts
}

function doesPropertyMatchAlert(property: any, criteria: any): boolean {
  // Type match
  if (criteria.type && criteria.type !== "any" && property.type !== criteria.type) {
    return false
  }

  // Property type match
  if (criteria.propertyType && criteria.propertyType !== "any" && property.propertyType !== criteria.propertyType) {
    return false
  }

  // Location match
  if (criteria.location && !property.location.toLowerCase().includes(criteria.location.toLowerCase())) {
    return false
  }

  // Zone match
  if (criteria.zone && criteria.zone !== "any" && property.zone !== criteria.zone) {
    return false
  }

  // Price range match
  const propertyPrice = property.priceNumeric || Number.parseFloat(property.price?.replace(/[^\d.]/g, "") || "0")
  if (propertyPrice < criteria.minPrice || propertyPrice > criteria.maxPrice) {
    return false
  }

  // Area range match
  const propertyArea = property.area || 0
  if (propertyArea < criteria.minArea || propertyArea > criteria.maxArea) {
    return false
  }

  // Bedrooms match
  if (criteria.bedrooms && criteria.bedrooms !== "any" && property.bedrooms !== criteria.bedrooms) {
    return false
  }

  // Furnishing match
  if (criteria.furnishing && criteria.furnishing !== "any" && property.furnishing !== criteria.furnishing) {
    return false
  }

  // Keywords match
  if (criteria.keywords) {
    const keywords = criteria.keywords.split(",").map((k: string) => k.trim().toLowerCase())
    const propertyText =
      `${property.title || ""} ${property.description || ""} ${property.amenities || ""}`.toLowerCase()

    const hasKeyword = keywords.some((keyword) => propertyText.includes(keyword))
    if (!hasKeyword) {
      return false
    }
  }

  // Amenities match
  if (criteria.amenities && criteria.amenities.length > 0) {
    const propertyAmenities = (property.amenities || "").toLowerCase()
    const hasRequiredAmenities = criteria.amenities.every((amenity: string) =>
      propertyAmenities.includes(amenity.toLowerCase()),
    )
    if (!hasRequiredAmenities) {
      return false
    }
  }

  // Verified properties only
  if (criteria.verified && !property.verified) {
    return false
  }

  return true
}

async function processAlertMatch(alert: any, property: any, db: any) {
  try {
    // Check if we should send notification based on frequency
    const shouldNotify = shouldSendNotificationNow(alert)

    if (!shouldNotify) {
      return
    }

    // Create notification record
    const notification = {
      alertId: alert._id,
      userId: alert.userId,
      alertName: alert.name,
      propertyId: property._id || new ObjectId(),
      propertyTitle: property.title || property.buildingSociety,
      propertyLocation: property.location,
      propertyPrice: property.price || property.rent || property.expectedPrice,
      propertyType: property.propertyType || property.type,
      matchReason: "New property matches your search criteria",
      sentAt: new Date(),
      channels: [],
      status: "pending",
      read: false,
    }

    // Send notifications based on preferences
    if (alert.emailEnabled) {
      await sendInstantEmailNotification(alert, property)
      notification.channels.push("email")
    }

    if (alert.smsEnabled) {
      await sendInstantSMSNotification(alert, property)
      notification.channels.push("sms")
    }

    if (alert.whatsappEnabled) {
      await sendInstantWhatsAppNotification(alert, property)
      notification.channels.push("whatsapp")
    }

    notification.status = "sent"

    // Save notification
    await db.collection("alert_notifications").insertOne(notification)

    // Update alert stats
    await db.collection("property_alerts").updateOne(
      { _id: alert._id },
      {
        $inc: { matchCount: 1 },
        $set: { lastTriggered: new Date() },
      },
    )
  } catch (error) {
    console.error("Error processing alert match:", error)
  }
}

function shouldSendNotificationNow(alert: any): boolean {
  if (alert.frequency === "instant") {
    return true
  }

  const now = new Date()
  const lastTriggered = alert.lastTriggered ? new Date(alert.lastTriggered) : null

  if (!lastTriggered) {
    return true
  }

  const timeDiff = now.getTime() - lastTriggered.getTime()

  switch (alert.frequency) {
    case "daily":
      return timeDiff >= 24 * 60 * 60 * 1000 // 24 hours
    case "weekly":
      return timeDiff >= 7 * 24 * 60 * 60 * 1000 // 7 days
    default:
      return false
  }
}

async function sendInstantEmailNotification(alert: any, property: any) {
  console.log(`📧 Instant email notification sent for alert: ${alert.name}`)
  console.log(`Property: ${property.title || property.buildingSociety}`)
  // Email service integration would go here
}

async function sendInstantSMSNotification(alert: any, property: any) {
  console.log(`📱 Instant SMS notification sent for alert: ${alert.name}`)
  console.log(`Property: ${property.title || property.buildingSociety}`)
  // SMS service integration would go here
}

async function sendInstantWhatsAppNotification(alert: any, property: any) {
  console.log(`💬 Instant WhatsApp notification sent for alert: ${alert.name}`)
  console.log(`Property: ${property.title || property.buildingSociety}`)
  // WhatsApp service integration would go here
}
