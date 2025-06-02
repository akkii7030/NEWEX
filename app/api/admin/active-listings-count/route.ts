import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "";

export async function GET() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db("real-estate");

    const rentalCount = await db.collection("rental_listings").countDocuments({ approved: true });
    const resaleCount = await db.collection("resale_listings").countDocuments({ approved: true });

    await client.close();

    return NextResponse.json({ activeListingsCount: rentalCount + resaleCount });
  } catch (error) {
    console.error("Error fetching active listings count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
