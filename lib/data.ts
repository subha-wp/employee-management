// Mock data and data management functions
import type { Employee, TimeEntry, Task, LoginSession, DashboardStats } from "./types"

// Mock data - In production, this would come from a database
export const mockEmployees: Employee[] = [
  {
    id: "1",
    email: "admin@company.com",
    password: "admin123", // In production, this would be hashed
    firstName: "John",
    lastName: "Admin",
    role: "admin",
    department: "Management",
    position: "System Administrator",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "sarah.manager@company.com",
    password: "manager123",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "manager",
    department: "Engineering",
    position: "Engineering Manager",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    email: "mike.dev@company.com",
    password: "employee123",
    firstName: "Mike",
    lastName: "Developer",
    role: "employee",
    department: "Engineering",
    position: "Senior Developer",
    isActive: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
]

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Set up secure login system with JWT tokens",
    assignedTo: "3",
    assignedBy: "2",
    priority: "high",
    status: "in-progress",
    dueDate: new Date("2024-12-30"),
    estimatedHours: 8,
    actualHours: 4,
    tags: ["authentication", "security"],
    createdAt: new Date("2024-12-20"),
    updatedAt: new Date("2024-12-25"),
  },
  {
    id: "2",
    title: "Design dashboard mockups",
    description: "Create wireframes and mockups for the admin dashboard",
    assignedTo: "3",
    assignedBy: "2",
    priority: "medium",
    status: "completed",
    dueDate: new Date("2024-12-28"),
    completedAt: new Date("2024-12-27"),
    estimatedHours: 6,
    actualHours: 5,
    tags: ["design", "ui/ux"],
    createdAt: new Date("2024-12-18"),
    updatedAt: new Date("2024-12-27"),
  },
]

export const mockTimeEntries: TimeEntry[] = [
  {
    id: "1",
    employeeId: "3",
    clockIn: new Date("2024-12-25T09:00:00"),
    clockOut: new Date("2024-12-25T17:30:00"),
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "New York, NY",
    },
    totalHours: 8.5,
    status: "completed",
    createdAt: new Date("2024-12-25T09:00:00"),
  },
  {
    id: "2",
    employeeId: "2",
    clockIn: new Date("2024-12-25T08:30:00"),
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "New York, NY",
    },
    status: "active",
    createdAt: new Date("2024-12-25T08:30:00"),
  },
]

// Data management functions
export class DataManager {
  private static employees = [...mockEmployees]
  private static tasks = [...mockTasks]
  private static timeEntries = [...mockTimeEntries]
  private static loginSessions: LoginSession[] = []

  // Employee methods
  static getEmployees(): Employee[] {
    return this.employees
  }

  static getEmployeeById(id: string): Employee | undefined {
    return this.employees.find((emp) => emp.id === id)
  }

  static getEmployeeByEmail(email: string): Employee | undefined {
    return this.employees.find((emp) => emp.email === email)
  }

  static authenticateEmployee(email: string, password: string): Employee | null {
    const employee = this.getEmployeeByEmail(email)
    if (employee && employee.password === password && employee.isActive) {
      return employee
    }
    return null
  }

  static addEmployee(employee: Employee): Employee {
    // Check if email already exists
    const existingEmployee = this.getEmployeeByEmail(employee.email)
    if (existingEmployee) {
      throw new Error("Employee with this email already exists")
    }

    this.employees.push(employee)
    return employee
  }

  static updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const employeeIndex = this.employees.findIndex((emp) => emp.id === id)
    if (employeeIndex === -1) return null

    // If updating email, check for duplicates
    if (updates.email && updates.email !== this.employees[employeeIndex].email) {
      const existingEmployee = this.getEmployeeByEmail(updates.email)
      if (existingEmployee) {
        throw new Error("Employee with this email already exists")
      }
    }

    this.employees[employeeIndex] = {
      ...this.employees[employeeIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return this.employees[employeeIndex]
  }

  static deactivateEmployee(id: string): Employee | null {
    return this.updateEmployee(id, { isActive: false })
  }

  static activateEmployee(id: string): Employee | null {
    return this.updateEmployee(id, { isActive: true })
  }

  static deleteEmployee(id: string): boolean {
    const employeeIndex = this.employees.findIndex((emp) => emp.id === id)
    if (employeeIndex === -1) return false

    // End any active login sessions for this employee
    this.loginSessions
      .filter((session) => session.employeeId === id && session.isActive)
      .forEach((session) => this.endLoginSession(session.id))

    // Clock out if currently clocked in
    this.clockOut(id)

    this.employees.splice(employeeIndex, 1)
    return true
  }

  // Task methods
  static getTasks(): Task[] {
    return this.tasks
  }

  static getTasksByEmployee(employeeId: string): Task[] {
    return this.tasks.filter((task) => task.assignedTo === employeeId)
  }

  static addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.tasks.push(newTask)
    return newTask
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const taskIndex = this.tasks.findIndex((task) => task.id === id)
    if (taskIndex === -1) return null

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return this.tasks[taskIndex]
  }

  // Time tracking methods
  static getTimeEntries(): TimeEntry[] {
    return this.timeEntries
  }

  static getTimeEntriesByEmployee(employeeId: string): TimeEntry[] {
    return this.timeEntries.filter((entry) => entry.employeeId === employeeId)
  }

  static clockIn(employeeId: string, location: { latitude: number; longitude: number; address?: string }): TimeEntry {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      employeeId,
      clockIn: new Date(),
      location,
      status: "active",
      createdAt: new Date(),
    }
    this.timeEntries.push(newEntry)
    return newEntry
  }

  static clockOut(employeeId: string): TimeEntry | null {
    const activeEntry = this.timeEntries.find((entry) => entry.employeeId === employeeId && entry.status === "active")

    if (!activeEntry) return null

    const clockOut = new Date()
    const totalHours = (clockOut.getTime() - activeEntry.clockIn.getTime()) / (1000 * 60 * 60)

    activeEntry.clockOut = clockOut
    activeEntry.totalHours = Math.round(totalHours * 100) / 100
    activeEntry.status = "completed"

    return activeEntry
  }

  // Login session methods
  static createLoginSession(
    employeeId: string,
    ipAddress: string,
    userAgent: string,
    location?: { latitude: number; longitude: number; address?: string },
  ): LoginSession {
    const session: LoginSession = {
      id: Date.now().toString(),
      employeeId,
      loginTime: new Date(),
      ipAddress,
      userAgent,
      location,
      isActive: true,
    }
    this.loginSessions.push(session)
    return session
  }

  static endLoginSession(sessionId: string): void {
    const session = this.loginSessions.find((s) => s.id === sessionId)
    if (session) {
      session.logoutTime = new Date()
      session.isActive = false
    }
  }

  static getLoginSessions(): LoginSession[] {
    return this.loginSessions
  }

  // Dashboard stats
  static getDashboardStats(): DashboardStats {
    const totalEmployees = this.employees.length
    const activeEmployees = this.employees.filter((emp) => emp.isActive).length
    const totalTasks = this.tasks.length
    const completedTasks = this.tasks.filter((task) => task.status === "completed").length
    const pendingTasks = this.tasks.filter((task) => task.status === "pending").length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEntries = this.timeEntries.filter((entry) => entry.clockIn >= today && entry.status === "completed")
    const totalHoursToday = todayEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
    const averageHoursPerEmployee = activeEmployees > 0 ? totalHoursToday / activeEmployees : 0

    return {
      totalEmployees,
      activeEmployees,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalHoursToday: Math.round(totalHoursToday * 100) / 100,
      averageHoursPerEmployee: Math.round(averageHoursPerEmployee * 100) / 100,
    }
  }
}
