"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { Employee } from "@prisma/client";

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
      // Get location for login tracking
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

      // Login via API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          location,
          userAgent: navigator.userAgent,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setIsLoading(false);
        return { success: false, error: result.error || "Login failed" };
      }

      const newSessionId = `session_${Date.now()}_${Math.random()}`;
      localStorage.setItem("employee_session", newSessionId);
      localStorage.setItem("employee_data", JSON.stringify(result.employee));
      localStorage.setItem("login_session_id", result.loginSession.id);

      setSessionId(newSessionId);
      setEmployee(result.employee);
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
        // Logout via API
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: employee.id,
          }),
        });
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
