import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, type ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""

// This endpoint would be called by a cron job to check for new matches
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")

    // Get all active alerts
    const alerts = await db.collection("property_alerts").find({ isActive: true }).toArray()

    for (const alert of alerts) {
      await checkAlertForMatches(alert, db)
    }

    await client.close()

    return NextResponse.json({ success: true, alertsChecked: alerts.length })
  } catch (error) {
    console.error("Error checking alerts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function checkAlertForMatches(alert: any, db: any) {
  try {
    // Build search criteria
    const searchCriteria: any = { approved: true }

    // Only check for properties created after last check
    const lastCheck = alert.lastTriggered || alert.createdAt
    searchCriteria.createdAt = { $gt: lastCheck }

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

    // Search for new matches
    const rentalMatches = await db.collection("rental_listings").find(searchCriteria).toArray()
    const resaleMatches = await db.collection("resale_listings").find(searchCriteria).toArray()

    const newMatches = [...rentalMatches, ...resaleMatches]

    if (newMatches.length > 0) {
      // Send notifications based on frequency
      const shouldSendNotification = checkNotificationFrequency(alert)

      if (shouldSendNotification) {
        await sendNotifications(alert._id, alert, newMatches, db)
      }

      // Update alert
      await db.collection("property_alerts").updateOne(
        { _id: alert._id },
        {
          $set: {
            lastTriggered: new Date(),
            matchCount: alert.matchCount + newMatches.length,
          },
        },
      )
    }
  } catch (error) {
    console.error("Error checking alert for matches:", error)
  }
}

function checkNotificationFrequency(alert: any): boolean {
  const now = new Date()
  const lastTriggered = alert.lastTriggered ? new Date(alert.lastTriggered) : null

  if (!lastTriggered) {
    return true // First time, always send
  }

  switch (alert.frequency) {
    case "instant":
      return true
    case "daily":
      const daysDiff = Math.floor((now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 1
    case "weekly":
      const weeksDiff = Math.floor((now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60 * 24 * 7))
      return weeksDiff >= 1
    default:
      return false
  }
}

async function sendNotifications(alertId: ObjectId, alert: any, matches: any[], db: any) {
  try {
    const notifications = db.collection("alert_notifications")

    for (const match of matches.slice(0, 3)) {
      // Limit to 3 notifications per alert check
      const notification = {
        alertId,
        userId: alert.userId,
        alertName: alert.name,
        propertyId: match._id,
        propertyTitle: match.title || match.buildingSociety,
        propertyLocation: match.location,
        propertyPrice: match.price || match.rent || match.expectedPrice,
        propertyType: match.propertyType || match.type,
        matchReason: "New property matches your criteria",
        sentAt: new Date(),
        channels: [],
        status: "pending",
      }

      // Send notifications based on user preferences
      if (alert.emailEnabled) {
        await sendEmailNotification(alert, match)
        notification.channels.push("email")
      }

      if (alert.smsEnabled) {
        await sendSMSNotification(alert, match)
        notification.channels.push("sms")
      }

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
  // Email notification implementation
  // This would integrate with an email service like SendGrid, AWS SES, etc.
  console.log(`📧 Email sent: New property alert for "${alert.name}"`)
  console.log(`Property: ${property.title || property.buildingSociety}`)

  // Example email content:
  const emailContent = {
    to: alert.userEmail,
    subject: `🏠 New Property Alert: ${alert.name}`,
    html: `
      <h2>New Property Match Found!</h2>
      <p>A new property matching your alert "${alert.name}" has been found:</p>
      <h3>${property.title || property.buildingSociety}</h3>
      <p><strong>Location:</strong> ${property.location}</p>
      <p><strong>Price:</strong> ${property.price || property.rent || property.expectedPrice}</p>
      <p><strong>Type:</strong> ${property.propertyType || property.type}</p>
      <a href="https://yourapp.com/property/${property._id}">View Property Details</a>
    `,
  }

  // Send email using your preferred service
  // await emailService.send(emailContent)
}

async function sendSMSNotification(alert: any, property: any) {
  // SMS notification implementation
  // This would integrate with an SMS service like Twilio, AWS SNS, etc.
  console.log(`📱 SMS sent: New property alert for "${alert.name}"`)

  const smsContent = `🏠 New Property Alert: ${property.title || property.buildingSociety} in ${property.location} for ${property.price || property.rent || property.expectedPrice}. View details: https://yourapp.com/property/${property._id}`

  // Send SMS using your preferred service
  // await smsService.send(alert.userPhone, smsContent)
}

async function sendWhatsAppNotification(alert: any, property: any) {
  // WhatsApp notification implementation
  // This would integrate with WhatsApp Business API
  console.log(`💬 WhatsApp sent: New property alert for "${alert.name}"`)

  const whatsappContent = `🏠 *New Property Alert*\n\n*${property.title || property.buildingSociety}*\n📍 ${property.location}\n💰 ${property.price || property.rent || property.expectedPrice}\n\nView details: https://yourapp.com/property/${property._id}`

  // Send WhatsApp message using your preferred service
  // await whatsappService.send(alert.userWhatsApp, whatsappContent)
}
