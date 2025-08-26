"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ProfileSection } from "@/components/dashboard/profile-section"
import { TaskManagement } from "@/components/dashboard/task-management"
import { TimeTracking } from "@/components/dashboard/time-tracking"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { useState } from "react"

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false) // Added mobile sidebar state

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "profile":
        return <ProfileSection />
      case "tasks":
        return <TaskManagement />
      case "timetracking":
        return <TimeTracking />
      case "admin":
        return <AdminDashboard />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader onMenuToggle={() => setIsMobileSidebarOpen(true)} activeTab={activeTab} />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="md:ml-64 min-h-screen">
        <main className="p-4 pt-20 md:p-6 md:pt-6">
          {" "}
          {/* Added top padding for mobile header and reduced side padding on mobile */}
          <div className="max-w-7xl mx-auto">
            {" "}
            {/* Added max width container for better large screen experience */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
