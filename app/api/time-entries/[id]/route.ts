import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedTimeEntry = await dataManager.updateTimeEntry(id, body);

    if (!updatedTimeEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Time entry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      timeEntry: updatedTimeEntry,
    });
  } catch (error) {
    console.error("Update time entry API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update time entry",
      },
      { status: 500 }
    );
  }
}
