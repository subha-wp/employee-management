"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Clock,
  CheckSquare,
  AlertTriangle,
  Activity,
  LogIn,
  UserPlus,
  TrendingUp,
  Building,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  MapPin,
  Download,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { dataManager } from "@/lib/data-prisma"
import { cn } from "@/lib/utils"
import type { Employee } from "@prisma/client"

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalHoursToday: number
  averageHoursPerEmployee: number
}

export function AdminDashboard() {
  const { employee } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const loadStats = async () => {
      try {
        const dashboardStats = await dataManager.getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error("Failed to load dashboard stats:", error)
      }
    }
    loadStats()
  }, [])

  if (!employee || (employee.role !== "ADMIN" && employee.role !== "MANAGER")) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-600">You don't have permission to access the admin dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Manage employees, tasks, and company operations</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1).toLowerCase()} Access
        </Badge>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">{stats.activeEmployees} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHoursToday}h</div>
              <p className="text-xs text-muted-foreground">{stats.averageHoursPerEmployee}h avg per employee</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks - stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">{stats.completedTasks} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminOverview />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <AttendanceMonitoring />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskManagementAdmin />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminOverview() {
  const [recentActivity, setRecentActivity] = useState<
    Array<{ id: string; type: string; message: string; time: string }>
  >([])
  const [showCreateEmployee, setShowCreateEmployee] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showDepartments, setShowDepartments] = useState(false)

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        const [loginSessions, tasks, employees] = await Promise.all([
          dataManager.getLoginSessions(),
          dataManager.getTasks(),
          dataManager.getEmployees(),
        ])

        const activities = []

        // Recent logins
        loginSessions.slice(0, 2).forEach((session) => {
          if (session.employee) {
            activities.push({
              id: `login-${session.id}`,
              type: "login",
              message: `${session.employee.firstName} ${session.employee.lastName} ${session.isActive ? "logged in" : "logged out"}`,
              time: new Date(session.loginTime).toLocaleString(),
            })
          }
        })

        // Recent task completions
        tasks
          .filter((task) => task.status === "COMPLETED")
          .slice(0, 2)
          .forEach((task) => {
            if (task.assignedEmployee) {
              activities.push({
                id: `task-${task.id}`,
                type: "task",
                message: `${task.assignedEmployee.firstName} ${task.assignedEmployee.lastName} completed '${task.title}'`,
                time: task.completedAt ? new Date(task.completedAt).toLocaleString() : "Recently",
              })
            }
          })

        setRecentActivity(activities.slice(0, 4))
      } catch (error) {
        console.error("Failed to load recent activity:", error)
      }
    }
    loadRecentActivity()
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      activity.type === "login" && "bg-green-100",
                      activity.type === "task" && "bg-blue-100",
                      activity.type === "employee" && "bg-purple-100",
                      activity.type === "system" && "bg-orange-100",
                    )}
                  >
                    {activity.type === "login" && <Clock className="w-4 h-4 text-green-600" />}
                    {activity.type === "task" && <CheckSquare className="w-4 h-4 text-blue-600" />}
                    {activity.type === "employee" && <Users className="w-4 h-4 text-purple-600" />}
                    {activity.type === "system" && <Shield className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.message}</p>
                    <p className="text-sm text-slate-600">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Dialog open={showCreateEmployee} onOpenChange={setShowCreateEmployee}>
              <DialogTrigger asChild>
                <Button className="h-12 justify-start gap-3">
                  <UserPlus className="w-5 h-5" />
                  Add New Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <CreateEmployeeForm onClose={() => setShowCreateEmployee(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 justify-start gap-3 bg-transparent">
                  <CheckSquare className="w-5 h-5" />
                  Assign Tasks
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <CreateTaskForm onClose={() => setShowCreateTask(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={showReports} onOpenChange={setShowReports}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 justify-start gap-3 bg-transparent">
                  <TrendingUp className="w-5 h-5" />
                  Generate Reports
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate Reports</DialogTitle>
                </DialogHeader>
                <ReportsGenerator onClose={() => setShowReports(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={showDepartments} onOpenChange={setShowDepartments}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12 justify-start gap-3 bg-transparent">
                  <Building className="w-5 h-5" />
                  Manage Departments
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Departments</DialogTitle>
                </DialogHeader>
                <DepartmentManager onClose={() => setShowDepartments(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateEmployeeForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "EMPLOYEE" as "ADMIN" | "MANAGER" | "EMPLOYEE",
    department: "",
    position: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await dataManager.addEmployee(formData)
      onClose()
    } catch (error) {
      console.error("Failed to create employee:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : "Create Employee"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function CreateTaskForm({ onClose }: { onClose: () => void }) {
  const { employee } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    dueDate: "",
    estimatedHours: "",
    tags: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const allEmployees = await dataManager.getEmployees()
        setEmployees(allEmployees)
      } catch (error) {
        console.error("Failed to load employees:", error)
      }
    }
    loadEmployees()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    setIsLoading(true)

    try {
      await dataManager.createTask({
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        assignedBy: employee.id,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate),
        estimatedHours: formData.estimatedHours ? Number.parseFloat(formData.estimatedHours) : undefined,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      onClose()
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignedTo">Assign To</Label>
          <Select
            value={formData.assignedTo}
            onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="frontend, urgent, bug-fix"
        />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : "Create Task"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ReportsGenerator({ onClose }: { onClose: () => void }) {
  const [reportType, setReportType] = useState("attendance")
  const [dateRange, setDateRange] = useState("week")

  const generateReport = () => {
    console.log(`Generating ${reportType} report for ${dateRange}`)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="reportType">Report Type</Label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attendance">Attendance Report</SelectItem>
            <SelectItem value="tasks">Task Completion Report</SelectItem>
            <SelectItem value="productivity">Productivity Report</SelectItem>
            <SelectItem value="department">Department Summary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="dateRange">Date Range</Label>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
        <Button onClick={generateReport} className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Generate Report
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function DepartmentManager({ onClose }: { onClose: () => void }) {
  const [departments, setDepartments] = useState<any[]>([])

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const allDepartments = await dataManager.getDepartments()
        setDepartments(allDepartments)
      } catch (error) {
        console.error("Failed to load departments:", error)
      }
    }
    loadDepartments()
  }, [])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{dept.name}</h4>
                <p className="text-sm text-slate-600">{dept.description}</p>
                <p className="text-xs text-slate-500">
                  Manager: {dept.manager?.firstName} {dept.manager?.lastName}
                </p>
              </div>
              <Badge variant="outline">{dept.employeeCount} employees</Badge>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-4">No departments found</p>
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button className="flex-1 gap-2">
          <Building className="w-4 h-4" />
          Add Department
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

function AttendanceMonitoring() {
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [loginSessions, setLoginSessions] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        const [allTimeEntries, allLoginSessions] = await Promise.all([
          dataManager.getTimeEntries(),
          dataManager.getLoginSessions(),
        ])

        setTimeEntries(allTimeEntries)
        setLoginSessions(allLoginSessions)
      } catch (error) {
        console.error("Failed to load attendance data:", error)
      }
    }
    loadAttendanceData()
  }, [])

  const getCurrentlyLoggedIn = () => {
    return loginSessions.filter((session) => session.isActive)
  }

  const getTodayTimeEntries = () => {
    const today = new Date(selectedDate)
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.clockIn)
      return entryDate >= today && entryDate < tomorrow
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const duration = (endTime.getTime() - start.getTime()) / (1000 * 60 * 60)
    return `${duration.toFixed(1)}h`
  }

  const currentlyLoggedIn = getCurrentlyLoggedIn()
  const todayEntries = getTodayTimeEntries()

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Online</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentlyLoggedIn.length}</div>
            <p className="text-xs text-muted-foreground">Employees logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <LogIn className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayEntries.length}</div>
            <p className="text-xs text-muted-foreground">Total attendance today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {todayEntries.length > 0
                ? (todayEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0) / todayEntries.length).toFixed(
                    1,
                  )
                : "0.0"}
              h
            </div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="date">Select Date:</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayEntries.length > 0 ? (
              todayEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {entry.employee?.firstName} {entry.employee?.lastName}
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {entry.address || `${entry.latitude}, ${entry.longitude}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatTime(entry.clockIn)} - {entry.clockOut ? formatTime(entry.clockOut) : "Active"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {entry.totalHours ? `${entry.totalHours}h` : formatDuration(entry.clockIn, entry.clockOut)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No attendance records for this date</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const allEmployees = await dataManager.getEmployees()
        setEmployees(allEmployees)
      } catch (error) {
        console.error("Failed to load employees:", error)
      }
    }
    loadEmployees()
  }, [])

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const departments = Array.from(new Set(employees.map((emp) => emp.department)))

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          employee.role === "ADMIN" && "border-red-200 text-red-800",
                          employee.role === "MANAGER" && "border-blue-200 text-blue-800",
                          employee.role === "EMPLOYEE" && "border-green-200 text-green-800",
                        )}
                      >
                        {employee.role.toLowerCase()}
                      </Badge>
                      {!employee.isActive && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                      <span>{employee.email}</span>
                      <span>•</span>
                      <span>{employee.department}</span>
                      <span>•</span>
                      <span>{employee.position}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskManagementAdmin() {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const allTasks = await dataManager.getTasks()
        setTasks(allTasks)
      } catch (error) {
        console.error("Failed to load tasks:", error)
      }
    }
    loadTasks()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">All Tasks</h3>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          task.priority === "URGENT" && "border-red-200 text-red-800",
                          task.priority === "HIGH" && "border-orange-200 text-orange-800",
                          task.priority === "MEDIUM" && "border-yellow-200 text-yellow-800",
                          task.priority === "LOW" && "border-green-200 text-green-800",
                        )}
                      >
                        {task.priority.toLowerCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          task.status === "COMPLETED" && "border-green-200 text-green-800",
                          task.status === "IN_PROGRESS" && "border-blue-200 text-blue-800",
                          task.status === "PENDING" && "border-gray-200 text-gray-800",
                        )}
                      >
                        {task.status.replace("_", " ").toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        Assigned to: {task.assignedEmployee?.firstName} {task.assignedEmployee?.lastName}
                      </span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      {task.estimatedHours && <span>Est: {task.estimatedHours}h</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No tasks found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReportsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <TrendingUp className="w-6 h-6" />
              <span>Productivity Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Clock className="w-6 h-6" />
              <span>Time Tracking Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Users className="w-6 h-6" />
              <span>Employee Summary</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Building className="w-6 h-6" />
              <span>Department Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
