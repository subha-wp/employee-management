"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { dataManager } from "@/lib/data-prisma";
import {
  Clock,
  CheckSquare,
  TrendingUp,
  MapPin,
  Calendar,
  Play,
  Square,
} from "lucide-react";
import { useState, useEffect } from "react";

export function DashboardOverview() {
  const { employee } = useAuth();
  const [stats, setStats] = useState({
    todayHours: 0,
    activeTasks: 0,
    completedTasks: 0,
    isClocked: false,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!employee) return;

      try {
        const [tasks, timeEntries, activeEntry] = await Promise.all([
          dataManager.getTasks(employee.id),
          dataManager.getTimeEntries(employee.id),
          dataManager.getActiveTimeEntry(employee.id),
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

        setStats({
          todayHours: Math.round(todayHours * 100) / 100,
          activeTasks: tasks.filter(
            (task) => task.status === "IN_PROGRESS" || task.status === "PENDING"
          ).length,
          completedTasks: tasks.filter((task) => task.status === "COMPLETED")
            .length,
          isClocked: !!activeEntry,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    };

    loadStats();
  }, [employee]);

  const handleClockAction = async () => {
    if (!employee) return;

    if (stats.isClocked) {
      // Clock out
      try {
        const activeEntry = await dataManager.getActiveTimeEntry(employee.id);
        if (activeEntry) {
          const now = new Date();
          const clockInTime = new Date(activeEntry.clockIn);
          const totalHours =
            (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

          await dataManager.updateTimeEntry(activeEntry.id, {
            clockOut: now,
            totalHours: Math.round(totalHours * 100) / 100,
            status: "COMPLETED",
          });
          setStats((prev) => ({ ...prev, isClocked: false }));
        }
      } catch (error) {
        console.error("Clock out failed:", error);
      }
    } else {
      // Clock in - get location first
      try {
        const location = await new Promise<{
          latitude: number;
          longitude: number;
          address?: string;
        } | null>((resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: `${position.coords.latitude.toFixed(
                  4
                )}, ${position.coords.longitude.toFixed(4)}`,
              });
            },
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });

        await dataManager.createTimeEntry({
          employeeId: employee.id,
          clockIn: new Date(),
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          address: location?.address || "Location unavailable",
        });
        setStats((prev) => ({ ...prev, isClocked: true }));
      } catch (error) {
        console.error("Clock in failed:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
          Good morning, {employee?.firstName}! 👋
        </h1>
        <p className="text-sm md:text-base text-slate-600">
          Ready to make today productive? Here's your overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayHours}</div>
            <p className="text-xs text-muted-foreground">
              {stats.isClocked ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Currently clocked in
                </Badge>
              ) : (
                "Not clocked in"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee?.department}</div>
            <p className="text-xs text-muted-foreground">
              {employee?.position}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.5h</div>
            <p className="text-xs text-muted-foreground">7.5h remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <Button
              onClick={handleClockAction}
              className={cn(
                "h-14 md:h-16 justify-start gap-3 text-left",
                stats.isClocked
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {stats.isClocked ? (
                <Square className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <div>
                <div className="font-medium text-sm md:text-base">
                  {stats.isClocked ? "Clock Out" : "Clock In"}
                </div>
                <div className="text-xs opacity-90">
                  {stats.isClocked
                    ? "End your work session"
                    : "Start tracking time"}
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-14 md:h-16 justify-start gap-3 text-left bg-transparent"
            >
              <CheckSquare className="w-5 h-5" />
              <div>
                <div className="font-medium text-sm md:text-base">
                  View Tasks
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.activeTasks} active tasks
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-14 md:h-16 justify-start gap-3 text-left bg-transparent md:col-span-1 col-span-1"
            >
              <MapPin className="w-5 h-5" />
              <div>
                <div className="font-medium text-sm md:text-base">Location</div>
                <div className="text-xs text-muted-foreground">
                  Update work location
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  Clocked in at 9:00 AM
                </p>
                <p className="text-sm text-slate-600">
                  Location: Office - Main Building
                </p>
              </div>
              <span className="text-xs text-slate-500">2 hours ago</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  Completed task: Design dashboard mockups
                </p>
                <p className="text-sm text-slate-600">
                  Took 5 hours to complete
                </p>
              </div>
              <span className="text-xs text-slate-500">Yesterday</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  Weekly goal achieved
                </p>
                <p className="text-sm text-slate-600">
                  Completed 40 hours this week
                </p>
              </div>
              <span className="text-xs text-slate-500">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
