import { dataManager } from "./data-prisma";

export async function setupAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await dataManager.getEmployeeByEmail(
      "dipenjayg132@gmail.com"
    );

    if (existingAdmin) {
      console.log("Admin user already exists");
      return existingAdmin;
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

    console.log("Admin user created successfully:", adminUser.email);
    return adminUser;
  } catch (error) {
    console.error("Failed to setup admin user:", error);
    throw error;
  }
}

export async function setupSampleData() {
  try {
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
      console.log("Sample manager created");
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
      console.log("Sample employee created");
    }

    console.log("Sample data setup completed");
  } catch (error) {
    console.error("Failed to setup sample data:", error);
  }
}
