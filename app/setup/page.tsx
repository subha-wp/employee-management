"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Users,
  Shield,
} from "lucide-react";

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    admin: boolean;
    samples: boolean;
    error?: string;
  }>({
    admin: false,
    samples: false,
  });

  const handleSetup = async () => {
    setIsLoading(true);
    setSetupStatus({ admin: false, samples: false });

    try {
      // Setup admin user via API
      const adminResponse = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "setup-admin" }),
      });

      const adminResult = await adminResponse.json();
      if (!adminResult.success) {
        throw new Error(adminResult.error || "Failed to setup admin user");
      }

      setSetupStatus((prev) => ({ ...prev, admin: true }));

      // Setup sample data via API
      const samplesResponse = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "setup-samples" }),
      });

      const samplesResult = await samplesResponse.json();
      if (!samplesResult.success) {
        throw new Error(samplesResult.error || "Failed to setup sample data");
      }

      setSetupStatus((prev) => ({ ...prev, samples: true }));
    } catch (error) {
      console.error("Setup failed:", error);
      setSetupStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Setup failed",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center px-6 pt-8">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              System Setup
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Initialize your employee management system
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8 space-y-6">
          {setupStatus.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{setupStatus.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {setupStatus.admin ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Shield className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Admin User</p>
                <p className="text-sm text-slate-600">
                  admin@company.com / admin123
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                {setupStatus.samples ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Users className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Sample Data</p>
                <p className="text-sm text-slate-600">
                  Manager and employee accounts
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSetup}
            disabled={isLoading || (setupStatus.admin && setupStatus.samples)}
            className="w-full h-12 font-medium text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : setupStatus.admin && setupStatus.samples ? (
              "Setup Complete!"
            ) : (
              "Initialize System"
            )}
          </Button>

          {setupStatus.admin && setupStatus.samples && (
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Setup completed successfully! You can now login with:
              </p>
              <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg">
                <div>
                  <strong>Admin:</strong> admin@company.com / admin123
                </div>
                <div>
                  <strong>Manager:</strong> manager@company.com / manager123
                </div>
                <div>
                  <strong>Employee:</strong> employee@company.com / employee123
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => (window.location.href = "/login")}
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
