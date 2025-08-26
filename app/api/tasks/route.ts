import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const tasks = await dataManager.getTasks(employeeId || undefined);

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      assignedTo,
      assignedBy,
      priority,
      dueDate,
      estimatedHours,
      tags,
    } = body;

    if (!title || !description || !assignedTo || !assignedBy || !dueDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const task = await dataManager.createTask({
      title,
      description,
      assignedTo,
      assignedBy,
      priority: priority || "MEDIUM",
      dueDate: new Date(dueDate),
      estimatedHours,
      tags: tags || [],
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Create task API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create task",
      },
      { status: 500 }
    );
  }
}
