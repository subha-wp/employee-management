import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    // Find active time entry
    const activeEntry = await dataManager.getActiveTimeEntry(employeeId);
    if (!activeEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "No active time entry found",
        },
        { status: 400 }
      );
    }

    // Calculate total hours
    const now = new Date();
    const clockInTime = new Date(activeEntry.clockIn);
    const totalHours =
      (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const updatedEntry = await dataManager.updateTimeEntry(activeEntry.id, {
      clockOut: now,
      totalHours: Math.round(totalHours * 100) / 100,
      status: "COMPLETED",
    });

    return NextResponse.json({
      success: true,
      timeEntry: updatedEntry,
    });
  } catch (error) {
    console.error("Clock out API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clock out",
      },
      { status: 500 }
    );
  }
}
