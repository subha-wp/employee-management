"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import {
  Play,
  Square,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  Coffee,
  Edit,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeEntry {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  totalHours?: number;
  status: "ACTIVE" | "COMPLETED";
  createdAt: string;
  employee?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function TimeTracking() {
  const { employee } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

  useEffect(() => {
    if (employee) {
      const loadTimeEntries = async () => {
        try {
          const response = await fetch(
            `/api/time-entries?employeeId=${employee.id}`
          );
          const result = await response.json();

          if (result.success) {
            setTimeEntries(result.timeEntries);
            const activeEntry = result.timeEntries.find(
              (entry: TimeEntry) => entry.status === "ACTIVE"
            );
            setCurrentEntry(activeEntry || null);
          }
        } catch (error) {
          console.error("Failed to load time entries:", error);
        }
      };

      loadTimeEntries();
    }
  }, [employee]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    if (!employee) return;
    setIsLoading(true);

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

      const response = await fetch("/api/time-entries/clock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employee.id,
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          address: location?.address || "Location unavailable",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCurrentEntry(result.timeEntry);
        setTimeEntries((prev) => [result.timeEntry, ...prev]);
      }
    } catch (error) {
      console.error("Clock in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = () => {
    if (!employee || !currentEntry) return;
    setIsLoading(true);

    try {
      const clockOut = async () => {
        const response = await fetch("/api/time-entries/clock-out", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: employee.id,
          }),
        });

        const result = await response.json();
        if (result.success) {
          const updatedEntry = result.timeEntry;
          setCurrentEntry(null);
          setTimeEntries((prev) =>
            prev.map((entry) =>
              entry.id === updatedEntry.id ? updatedEntry : entry
            )
          );
        }
      };

      clockOut();
    } catch (error) {
      console.error("Clock out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentSessionDuration = () => {
    if (!currentEntry) return "00:00:00";
    const duration =
      currentTime.getTime() - new Date(currentEntry.clockIn).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.clockIn);
      switch (selectedPeriod) {
        case "today":
          return entryDate >= today;
        case "week":
          return entryDate >= weekStart;
        case "month":
          return entryDate >= monthStart;
        default:
          return true;
      }
    });
  };

  const getTotalHours = () => {
    const filtered = getFilteredEntries();
    return filtered
      .filter((entry) => entry.status === "COMPLETED")
      .reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  };

  const getAverageHours = () => {
    const filtered = getFilteredEntries();
    const completedEntries = filtered.filter(
      (entry) => entry.status === "COMPLETED"
    );
    if (completedEntries.length === 0) return 0;

    const uniqueDays = new Set(
      completedEntries.map((entry) => new Date(entry.clockIn).toDateString())
    ).size;
    return getTotalHours() / uniqueDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Time Tracking
          </h1>
          <p className="text-slate-600">
            Track your work hours and manage time entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["today", "week", "month"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period as typeof selectedPeriod)}
              className={selectedPeriod !== period ? "bg-transparent" : ""}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Status Card */}
      <Card
        className={cn(
          "border-2",
          currentEntry ? "border-green-200 bg-green-50/30" : "border-slate-200"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  currentEntry ? "bg-green-100" : "bg-slate-100"
                )}
              >
                {currentEntry ? (
                  <Clock className="w-6 h-6 text-green-600" />
                ) : (
                  <Play className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {currentEntry ? "Currently Working" : "Not Clocked In"}
                </h3>
                <p className="text-slate-600">
                  {currentEntry
                    ? `Started at ${new Date(
                        currentEntry.clockIn
                      ).toLocaleTimeString()}`
                    : "Ready to start your work session"}
                </p>
                {currentEntry && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{currentEntry.address || "Location recorded"}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              {currentEntry && (
                <div className="text-3xl font-mono font-bold text-green-600 mb-2">
                  {getCurrentSessionDuration()}
                </div>
              )}
              <Button
                onClick={currentEntry ? handleClockOut : handleClockIn}
                disabled={isLoading}
                className={cn(
                  "gap-2",
                  currentEntry
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentEntry ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isLoading
                  ? "Processing..."
                  : currentEntry
                  ? "Clock Out"
                  : "Clock In"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalHours().toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPeriod === "today" ? "Today" : `This ${selectedPeriod}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverageHours().toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">Per working day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getFilteredEntries().length}
            </div>
            <p className="text-xs text-muted-foreground">Work sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentEntry ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Idle</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-16 justify-start gap-3 text-left bg-transparent"
            >
              <Coffee className="w-5 h-5" />
              <div>
                <div className="font-medium">Take Break</div>
                <div className="text-xs text-muted-foreground">
                  Pause time tracking
                </div>
              </div>
            </Button>

            <AddTimeEntryDialog
              onEntryAdded={(entry) => {
                setTimeEntries((prev) => [entry, ...prev]);
              }}
            />

            <Button
              variant="outline"
              className="h-16 justify-start gap-3 text-left bg-transparent"
            >
              <Calendar className="w-5 h-5" />
              <div>
                <div className="font-medium">View Reports</div>
                <div className="text-xs text-muted-foreground">
                  Detailed time analysis
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFilteredEntries().length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No time entries
                </h3>
                <p className="text-slate-600">
                  Start tracking your time to see entries here
                </p>
              </div>
            ) : (
              getFilteredEntries().map((entry) => (
                <TimeEntryCard key={entry.id} entry={entry} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimeEntryCard({ entry }: { entry: TimeEntry }) {
  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const isToday =
    new Date(entry.clockIn).toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            entry.status === "ACTIVE" ? "bg-green-100" : "bg-slate-100"
          )}
        >
          {entry.status === "ACTIVE" ? (
            <Clock className="w-5 h-5 text-green-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-slate-600" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">
              {new Date(entry.clockIn).toLocaleTimeString()} -{" "}
              {entry.clockOut
                ? new Date(entry.clockOut).toLocaleTimeString()
                : "In Progress"}
            </span>
            {entry.status === "ACTIVE" && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
            <span>
              {isToday ? "Today" : new Date(entry.clockIn).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{entry.address || "Location recorded"}</span>
            </div>
            {entry.notes && (
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>{entry.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {entry.totalHours && (
          <div className="text-right">
            <div className="font-semibold text-slate-900">
              {formatDuration(entry.totalHours)}
            </div>
            <div className="text-xs text-slate-500">Duration</div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function AddTimeEntryDialog({
  onEntryAdded,
}: {
  onEntryAdded: (entry: TimeEntry) => void;
}) {
  const { employee } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    const totalHours =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employee.id,
          clockIn: startDateTime.toISOString(),
          latitude: 0,
          longitude: 0,
          address: "Manual entry",
          notes: formData.notes || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Update the entry to mark as completed with clock out time
        const updateResponse = await fetch(
          `/api/time-entries/${result.timeEntry.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clockOut: endDateTime.toISOString(),
              totalHours: Math.round(totalHours * 100) / 100,
              status: "COMPLETED",
            }),
          }
        );

        const updateResult = await updateResponse.json();
        if (updateResult.success) {
          onEntryAdded(updateResult.timeEntry);
        }
      }
    } catch (error) {
      console.error("Failed to add time entry:", error);
    }

    setIsOpen(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      notes: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-16 justify-start gap-3 text-left bg-transparent"
        >
          <Edit className="w-5 h-5" />
          <div>
            <div className="font-medium">Add Entry</div>
            <div className="text-xs text-muted-foreground">
              Manual time entry
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add any notes about this time entry"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Entry</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
