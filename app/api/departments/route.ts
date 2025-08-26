import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function GET(request: NextRequest) {
  try {
    const departments = await dataManager.getDepartments();
    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get departments API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch departments",
      },
      { status: 500 }
    );
  }
}
