import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, location, userAgent } = body;

    // Validate employee credentials
    const authenticatedEmployee = await dataManager.validateEmployee(
      email,
      password
    );

    if (!authenticatedEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Create login session
    const loginSession = await dataManager.createLoginSession({
      employeeId: authenticatedEmployee.id,
      ipAddress: "127.0.0.1", // In production, get real IP from headers
      userAgent: userAgent || "Unknown",
      latitude: location?.latitude,
      longitude: location?.longitude,
      address: location?.address,
    });

    // Create time entry if location is available
    if (location) {
      await dataManager.createTimeEntry({
        employeeId: authenticatedEmployee.id,
        clockIn: new Date(),
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        notes: "Automatic clock-in on login",
      });
    }

    return NextResponse.json({
      success: true,
      employee: authenticatedEmployee,
      loginSession,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Login failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
