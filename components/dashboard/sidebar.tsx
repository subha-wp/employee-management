"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  Home,
  Clock,
  CheckSquare,
  User,
  BarChart3,
  LogOut,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const { employee, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "timetracking", label: "Time Tracking", icon: Clock },
    { id: "tasks", label: "My Tasks", icon: CheckSquare },
    { id: "profile", label: "Profile", icon: User },
    ...(employee?.role === "ADMIN" || employee?.role === "MANAGER"
      ? [{ id: "admin", label: "Admin Panel", icon: BarChart3 }]
      : []),
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onClose(); // Close mobile menu when tab is selected
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 z-40 h-full bg-white border-r border-slate-200 w-64 flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">EMS</h2>
              <p className="text-xs text-slate-600">Employee Management</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {employee?.firstName} {employee?.lastName}
              </p>
              <p className="text-sm text-slate-600 truncate">
                {employee?.position}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-700"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "md:hidden fixed left-0 top-0 z-50 h-full bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out w-80",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">EMS</h2>
                <p className="text-xs text-slate-600">Employee Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile User info */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {employee?.firstName} {employee?.lastName}
                </p>
                <p className="text-sm text-slate-600 truncate">
                  {employee?.position}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {employee?.department}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Button
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-4 h-12 text-base",
                        activeTab === item.id
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                      onClick={() => handleTabChange(item.id)}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-slate-200">
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 text-slate-700 h-12 text-base"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
}
