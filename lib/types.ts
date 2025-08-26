// Employee Management System Types

export interface Employee {
  id: string
  email: string
  password: string // In production, this would be hashed
  firstName: string
  lastName: string
  role: "admin" | "manager" | "employee"
  department: string
  position: string
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TimeEntry {
  id: string
  employeeId: string
  clockIn: Date
  clockOut?: Date
  location: {
    latitude: number
    longitude: number
    address?: string
  }
  notes?: string
  totalHours?: number
  status: "active" | "completed"
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string // employeeId
  assignedBy: string // employeeId
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  dueDate: Date
  completedAt?: Date
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  id: string
  name: string
  description: string
  managerId: string
  employeeCount: number
}

export interface LoginSession {
  id: string
  employeeId: string
  loginTime: Date
  logoutTime?: Date
  ipAddress: string
  userAgent: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  isActive: boolean
}

export interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalHoursToday: number
  averageHoursPerEmployee: number
}
