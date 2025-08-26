import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function GET(request: NextRequest) {
  try {
    const employees = await dataManager.getEmployees();
    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Get employees API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch employees",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role, department, position } =
      body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !department ||
      !position
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const newEmployee = await dataManager.addEmployee({
      email,
      password,
      firstName,
      lastName,
      role: role || "EMPLOYEE",
      department,
      position,
    });

    return NextResponse.json({
      success: true,
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Create employee API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create employee",
      },
      { status: 500 }
    );
  }
}
