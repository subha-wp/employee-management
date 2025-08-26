"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { User, Mail, Building, Calendar, Edit } from "lucide-react";
import { useState } from "react";

export function ProfileSection() {
  const { employee } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!employee) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2 bg-transparent"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-slate-600" />
            </div>
            <CardTitle className="text-xl">
              {employee.firstName} {employee.lastName}
            </CardTitle>
            <p className="text-slate-600">{employee.position}</p>
            <Badge variant="secondary" className="w-fit mx-auto mt-2">
              {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700">{employee.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700">
                Joined {new Date(employee.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={employee.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={employee.lastName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={employee.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" defaultValue={employee.position} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue={employee.department} />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    First Name
                  </Label>
                  <p className="mt-1 text-slate-900">{employee.firstName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Last Name
                  </Label>
                  <p className="mt-1 text-slate-900">{employee.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <p className="mt-1 text-slate-900">{employee.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Position
                  </Label>
                  <p className="mt-1 text-slate-900">{employee.position}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Department
                  </Label>
                  <p className="mt-1 text-slate-900">{employee.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Employee ID
                  </Label>
                  <p className="mt-1 text-slate-900">
                    EMP-{employee.id.padStart(4, "0")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Work Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Work Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">156</div>
              <p className="text-sm text-slate-600">Total Hours This Month</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">23</div>
              <p className="text-sm text-slate-600">Tasks Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">98%</div>
              <p className="text-sm text-slate-600">Attendance Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">4.8</div>
              <p className="text-sm text-slate-600">Performance Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
