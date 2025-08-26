import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (employeeId) {
      // Get stats for specific employee
      const [tasks, timeEntries, activeEntry] = await Promise.all([
        dataManager.getTasks(employeeId),
        dataManager.getTimeEntries(employeeId),
        dataManager.getActiveTimeEntry(employeeId),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEntries = timeEntries.filter(
        (entry) =>
          new Date(entry.clockIn) >= today && entry.status === "COMPLETED"
      );
      const todayHours = todayEntries.reduce(
        (sum, entry) => sum + (entry.totalHours || 0),
        0
      );

      return NextResponse.json({
        success: true,
        stats: {
          todayHours: Math.round(todayHours * 100) / 100,
          activeTasks: tasks.filter(
            (task) => task.status === "IN_PROGRESS" || task.status === "PENDING"
          ).length,
          completedTasks: tasks.filter((task) => task.status === "COMPLETED")
            .length,
          isClocked: !!activeEntry,
          totalTasks: tasks.length,
        },
      });
    } else {
      // Get overall dashboard stats
      const stats = await dataManager.getDashboardStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }
  } catch (error) {
    console.error("Get dashboard stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard stats",
      },
      { status: 500 }
    );
  }
}
