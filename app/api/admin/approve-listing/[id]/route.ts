import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "estatex";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const listingId = params.id;

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db("real-estate");

    // Try to update in both collections
    const rentalUpdate = await db.collection("rental_listings").updateOne(
      { _id: new ObjectId(listingId) },
      {
        $set: {
          approved: true,
          status: "Active",
          approvedAt: new Date(),
          approvedBy: new ObjectId(decoded.userId),
        },
      }
    );

    const resaleUpdate = await db.collection("resale_listings").updateOne(
      { _id: new ObjectId(listingId) },
      {
        $set: {
          approved: true,
          status: "Active",
          approvedAt: new Date(),
          approvedBy: new ObjectId(decoded.userId),
        },
      }
    );

    await client.close();

    if (rentalUpdate.modifiedCount > 0 || resaleUpdate.modifiedCount > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error approving listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
