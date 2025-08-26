import { NextRequest, NextResponse } from "next/server";
import { dataManager } from "@/lib/data-prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "setup-admin") {
      // Check if admin user already exists
      const existingAdmin = await dataManager.getEmployeeByEmail(
        "dipenjayg132@gmail.com"
      );

      if (existingAdmin) {
        return NextResponse.json({
          success: true,
          message: "Admin user already exists",
          user: existingAdmin,
        });
      }

      // Create admin user
      const adminUser = await dataManager.addEmployee({
        email: "dipenjayg132@gmail.com",
        password: "LIC@427",
        firstName: "Dipenjay",
        lastName: "Ghosh",
        role: "ADMIN",
        department: "IT",
        position: "System Administrator",
      });

      return NextResponse.json({
        success: true,
        message: "Admin user created successfully",
        user: adminUser,
      });
    }

    if (action === "setup-samples") {
      // Create sample manager
      const existingManager = await dataManager.getEmployeeByEmail(
        "manager@company.com"
      );

      if (!existingManager) {
        await dataManager.addEmployee({
          email: "manager@company.com",
          password: "manager123",
          firstName: "John",
          lastName: "Manager",
          role: "MANAGER",
          department: "Engineering",
          position: "Engineering Manager",
        });
      }

      // Create sample employee
      const existingEmployee = await dataManager.getEmployeeByEmail(
        "employee@company.com"
      );

      if (!existingEmployee) {
        await dataManager.addEmployee({
          email: "employee@company.com",
          password: "employee123",
          firstName: "Jane",
          lastName: "Employee",
          role: "EMPLOYEE",
          department: "Engineering",
          position: "Software Developer",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Sample data created successfully",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Setup API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Setup failed",
      },
      { status: 500 }
    );
  }
}
