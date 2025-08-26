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

    // Clock out if currently clocked in
    const activeTimeEntry = await dataManager.getActiveTimeEntry(employeeId);
    if (activeTimeEntry) {
      const now = new Date();
      const clockInTime = new Date(activeTimeEntry.clockIn);
      const totalHours =
        (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      await dataManager.updateTimeEntry(activeTimeEntry.id, {
        clockOut: now,
        totalHours: Math.round(totalHours * 100) / 100,
        status: "COMPLETED",
      });
    }

    // End login session
    await dataManager.endLoginSession(employeeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Logout failed",
      },
      { status: 500 }
    );
  }
}
