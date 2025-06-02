import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db("real-estate");
    const users = db.collection("users");

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    await client.close();

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: "User role updated successfully" });
    } else {
      return NextResponse.json({ error: "User not found or role not updated" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
