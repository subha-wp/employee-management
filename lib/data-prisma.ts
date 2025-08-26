import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { Employee, Task, TimeEntry } from "@prisma/client"

export class PrismaDataManager {
  // Employee Management
  async addEmployee(employeeData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: "ADMIN" | "MANAGER" | "EMPLOYEE"
    department: string
    position: string
  }) {
    const hashedPassword = await bcrypt.hash(employeeData.password, 10)

    return await prisma.employee.create({
      data: {
        ...employeeData,
        password: hashedPassword,
      },
    })
  }

  async getEmployees() {
    return await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async getEmployeeByEmail(email: string) {
    return await prisma.employee.findUnique({
      where: { email },
    })
  }

  async validateEmployee(email: string, password: string) {
    const employee = await this.getEmployeeByEmail(email)
    if (!employee || !employee.isActive) return null

    const isValid = await bcrypt.compare(password, employee.password)
    if (!isValid) return null

    const { password: _, ...employeeWithoutPassword } = employee
    return employeeWithoutPassword
  }

  async updateEmployee(id: string, data: Partial<Employee>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    return await prisma.employee.update({
      where: { id },
      data,
    })
  }

  async deactivateEmployee(id: string) {
    return await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    })
  }

  // Time Tracking
  async createTimeEntry(data: {
    employeeId: string
    clockIn: Date
    latitude: number
    longitude: number
    address?: string
    notes?: string
  }) {
    return await prisma.timeEntry.create({
      data: {
        ...data,
        status: "ACTIVE",
      },
    })
  }

  async updateTimeEntry(id: string, data: Partial<TimeEntry>) {
    return await prisma.timeEntry.update({
      where: { id },
      data,
    })
  }

  async getTimeEntries(employeeId?: string) {
    return await prisma.timeEntry.findMany({
      where: employeeId ? { employeeId } : {},
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { clockIn: "desc" },
    })
  }

  async getActiveTimeEntry(employeeId: string) {
    return await prisma.timeEntry.findFirst({
      where: {
        employeeId,
        status: "ACTIVE",
      },
    })
  }

  // Task Management
  async createTask(data: {
    title: string
    description: string
    assignedTo: string
    assignedBy: string
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    dueDate: Date
    estimatedHours?: number
    tags: string[]
  }) {
    return await prisma.task.create({
      data,
    })
  }

  async getTasks(employeeId?: string) {
    return await prisma.task.findMany({
      where: employeeId ? { assignedTo: employeeId } : {},
      include: {
        assignedEmployee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdByEmployee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async updateTask(id: string, data: Partial<Task>) {
    return await prisma.task.update({
      where: { id },
      data,
    })
  }

  // Login Sessions
  async createLoginSession(data: {
    employeeId: string
    ipAddress: string
    userAgent: string
    latitude?: number
    longitude?: number
    address?: string
  }) {
    return await prisma.loginSession.create({
      data,
    })
  }

  async endLoginSession(employeeId: string) {
    return await prisma.loginSession.updateMany({
      where: {
        employeeId,
        isActive: true,
      },
      data: {
        logoutTime: new Date(),
        isActive: false,
      },
    })
  }

  async getLoginSessions() {
    return await prisma.loginSession.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { loginTime: "desc" },
    })
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [totalEmployees, activeEmployees, totalTasks, completedTasks, pendingTasks, todayTimeEntries] =
      await Promise.all([
        prisma.employee.count({ where: { isActive: true } }),
        prisma.loginSession.count({ where: { isActive: true } }),
        prisma.task.count(),
        prisma.task.count({ where: { status: "COMPLETED" } }),
        prisma.task.count({ where: { status: "PENDING" } }),
        prisma.timeEntry.findMany({
          where: {
            clockIn: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ])

    const totalHoursToday = todayTimeEntries.reduce((sum, entry) => {
      return sum + (entry.totalHours || 0)
    }, 0)

    return {
      totalEmployees,
      activeEmployees,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalHoursToday,
      averageHoursPerEmployee: totalEmployees > 0 ? totalHoursToday / totalEmployees : 0,
    }
  }

  // Departments
  async getDepartments() {
    return await prisma.department.findMany({
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })
  }
}

export const dataManager = new PrismaDataManager()
