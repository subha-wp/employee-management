import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const timeEntries = await dataManager.getTimeEntries(
      employeeId || undefined
    );

    return NextResponse.json({
      success: true,
      timeEntries,
    });
  } catch (error) {
    console.error("Get time entries API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch time entries",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, clockIn, latitude, longitude, address, notes } = body;

    if (
      !employeeId ||
      !clockIn ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const timeEntry = await dataManager.createTimeEntry({
      employeeId,
      clockIn: new Date(clockIn),
      latitude,
      longitude,
      address,
      notes,
    });

    return NextResponse.json({
      success: true,
      timeEntry,
    });
  } catch (error) {
    console.error("Create time entry API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create time entry",
      },
      { status: 500 }
    );
  }
}
