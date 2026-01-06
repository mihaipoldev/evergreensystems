import { NextResponse } from "next/server";

export async function GET() {
  console.log("[API] Test route hit!");
  return NextResponse.json({ message: "Test route works!" }, { status: 200 });
}

