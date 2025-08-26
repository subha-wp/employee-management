"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { Employee } from "@prisma/client";
import { dataManager } from "@/lib/data-prisma";
import { LocationManager } from "@/lib/location";

interface AuthContextType {
  employee: Omit<Employee, "password"> | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Omit<Employee, "password"> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee_data");
    const storedSessionId = localStorage.getItem("employee_session");

    if (storedEmployee && storedSessionId) {
      try {
        const parsedEmployee = JSON.parse(storedEmployee);
        setEmployee(parsedEmployee);
        setSessionId(storedSessionId);
      } catch (error) {
        localStorage.removeItem("employee_data");
        localStorage.removeItem("employee_session");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const authenticatedEmployee = await dataManager.validateEmployee(
        email,
        password
      );

      if (!authenticatedEmployee) {
        setIsLoading(false);
        return { success: false, error: "Invalid email or password" };
      }

      // Get location for login tracking
      const location = await LocationManager.getCurrentLocation();

      const loginSession = await dataManager.createLoginSession({
        employeeId: authenticatedEmployee.id,
        ipAddress: "127.0.0.1", // In production, get real IP
        userAgent: navigator.userAgent,
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: location?.address,
      });

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

      const newSessionId = `session_${Date.now()}_${Math.random()}`;
      localStorage.setItem("employee_session", newSessionId);
      localStorage.setItem(
        "employee_data",
        JSON.stringify(authenticatedEmployee)
      );
      localStorage.setItem("login_session_id", loginSession.id);

      setSessionId(newSessionId);
      setEmployee(authenticatedEmployee);
      setIsLoading(false);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const logout = async () => {
    if (employee) {
      try {
        const activeTimeEntry = await dataManager.getActiveTimeEntry(
          employee.id
        );
        if (activeTimeEntry) {
          const now = new Date();
          const clockInTime = new Date(activeTimeEntry.clockIn);
          const totalHours =
            (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

          await dataManager.updateTimeEntry(activeTimeEntry.id, {
            clockOut: now,
            totalHours: Math.round(totalHours * 100) / 100,
            status: "COMPLETED",
          });
        }

        await dataManager.endLoginSession(employee.id);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    localStorage.removeItem("employee_session");
    localStorage.removeItem("employee_data");
    localStorage.removeItem("login_session_id");

    setEmployee(null);
    setSessionId(null);
  };

  const value: AuthContextType = {
    employee,
    isLoading,
    login,
    logout,
    isAuthenticated: !!employee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
