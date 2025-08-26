import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function GET(request: NextRequest) {
  try {
    const loginSessions = await dataManager.getLoginSessions();
    return NextResponse.json({
      success: true,
      loginSessions,
    });
  } catch (error) {
    console.error("Get login sessions API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch login sessions",
      },
      { status: 500 }
    );
  }
}
