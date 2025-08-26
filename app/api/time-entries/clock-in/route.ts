import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, latitude, longitude, address } = body;

    if (!employeeId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check if employee is already clocked in
    const activeEntry = await dataManager.getActiveTimeEntry(employeeId);
    if (activeEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee is already clocked in",
        },
        { status: 400 }
      );
    }

    const timeEntry = await dataManager.createTimeEntry({
      employeeId,
      clockIn: new Date(),
      latitude,
      longitude,
      address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    });

    return NextResponse.json({
      success: true,
      timeEntry,
    });
  } catch (error) {
    console.error("Clock in API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clock in",
      },
      { status: 500 }
    );
  }
}
