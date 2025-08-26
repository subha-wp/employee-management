"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Menu, Bell, User, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MobileHeaderProps {
  onMenuToggle: () => void
  activeTab: string
}

export function MobileHeader({ onMenuToggle, activeTab }: MobileHeaderProps) {
  const { employee, logout } = useAuth()

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard"
      case "tasks":
        return "My Tasks"
      case "timetracking":
        return "Time Tracking"
      case "profile":
        return "Profile"
      case "admin":
        return "Admin Panel"
      default:
        return "Dashboard"
    }
  }

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onMenuToggle} className="h-8 w-8 p-0">
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-slate-900">{getPageTitle(activeTab)}</h1>
            <p className="text-xs text-slate-600">Welcome, {employee?.firstName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
