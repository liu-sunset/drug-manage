import { Outlet } from "react-router-dom"
import { AppHeader } from "@/components/AppHeader"

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
