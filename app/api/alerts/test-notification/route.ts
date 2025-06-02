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
    const users = db.collection("users")

    // Get user details
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      await client.close()
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create test notification
    const testNotification = {
      alertId: new ObjectId(),
      userId: new ObjectId(decoded.userId),
      alertName: "Test Alert",
      propertyTitle: "Beautiful 2BHK Test Property",
      propertyLocation: "Test Location, Mumbai",
      propertyPrice: "₹50,000/month",
      propertyType: "2BHK",
      matchReason: "This is a test notification",
      sentAt: new Date(),
      channels: body.channels || ["email"],
      status: "sent",
      isTest: true,
    }

    // Send test notifications
    const results = []

    if (body.channels.includes("email")) {
      const emailResult = await sendTestEmail(user, testNotification)
      results.push({ channel: "email", success: emailResult.success, message: emailResult.message })
    }

    if (body.channels.includes("sms")) {
      const smsResult = await sendTestSMS(user, testNotification)
      results.push({ channel: "sms", success: smsResult.success, message: smsResult.message })
    }

    if (body.channels.includes("whatsapp")) {
      const whatsappResult = await sendTestWhatsApp(user, testNotification)
      results.push({ channel: "whatsapp", success: whatsappResult.success, message: whatsappResult.message })
    }

    // Save test notification to database
    await db.collection("alert_notifications").insertOne(testNotification)

    await client.close()

    return NextResponse.json({
      success: true,
      message: "Test notifications sent",
      results,
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendTestEmail(user: any, notification: any) {
  try {
    // Email service integration would go here
    // For now, we'll simulate the email sending
    console.log(`📧 Test email sent to: ${user.email}`)
    console.log(`Subject: 🏠 Test Property Alert`)
    console.log(`Property: ${notification.propertyTitle}`)

    return { success: true, message: "Test email sent successfully" }
  } catch (error) {
    console.error("Error sending test email:", error)
    return { success: false, message: "Failed to send test email" }
  }
}

async function sendTestSMS(user: any, notification: any) {
  try {
    // SMS service integration would go here
    // For now, we'll simulate the SMS sending
    console.log(`📱 Test SMS sent to: ${user.phone || "No phone number"}`)
    console.log(`Message: 🏠 Test Property Alert: ${notification.propertyTitle}`)

    return { success: true, message: "Test SMS sent successfully" }
  } catch (error) {
    console.error("Error sending test SMS:", error)
    return { success: false, message: "Failed to send test SMS" }
  }
}

async function sendTestWhatsApp(user: any, notification: any) {
  try {
    // WhatsApp service integration would go here
    // For now, we'll simulate the WhatsApp sending
    console.log(`💬 Test WhatsApp sent to: ${user.whatsapp || "No WhatsApp number"}`)
    console.log(`Message: 🏠 Test Property Alert: ${notification.propertyTitle}`)

    return { success: true, message: "Test WhatsApp sent successfully" }
  } catch (error) {
    console.error("Error sending test WhatsApp:", error)
    return { success: false, message: "Failed to send test WhatsApp" }
  }
}
