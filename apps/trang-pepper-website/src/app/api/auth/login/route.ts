// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@southern-syntax/auth/service";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = await authenticateUser({ email, password });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    return NextResponse.json({ message: "success" });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Database connection error"
    ) {
      return NextResponse.json(
        { message: "Database connection error" },
        { status: 500 }
      );
    }
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
