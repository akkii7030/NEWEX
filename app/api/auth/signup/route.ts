import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGO_URI || ""
const JWT_SECRET = process.env.JWT_SECRET || "estatex"
const ADMIN_PHONE = "7758085393" // Special admin phone number

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, number, email, password, reraNumber, state, district, location, latitude, longitude } = body

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    const db = client.db("real-estate")
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      await client.close()
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine role based on phone number
    const role = number === ADMIN_PHONE ? "admin" : "user"

    // Create user
    const user = {
      name,
      number,
      email,
      password: hashedPassword,
      reraNumber,
      state,
      district,
      location,
      latitude: Number.parseFloat(latitude) || 0,
      longitude: Number.parseFloat(longitude) || 0,
      role,
      isSubscribed: role === "admin" ? true : false, // Admin gets automatic subscription
      subscribedLocations: role === "admin" ? [] : [], // Admin has access to all locations
      createdAt: new Date(),
    }

    const result = await users.insertOne(user)

    // Generate JWT token
    const token = jwt.sign({ userId: result.insertedId, email, role }, JWT_SECRET, { expiresIn: "7d" })

    await client.close()

    return NextResponse.json({
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        role,
        isSubscribed: user.isSubscribed,
        subscribedLocations: user.subscribedLocations,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
