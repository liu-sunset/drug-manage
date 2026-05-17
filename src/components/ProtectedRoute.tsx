import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { PillIcon } from "lucide-react"

const loadingFallback = (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <div
      className="w-14 h-14 flex items-center justify-center bg-white border-[3px] border-pencil shadow-hard animate-pulse"
      style={{ borderRadius: "185px 25px 155px 25px / 25px 175px 25px 165px" }}
    >
      <PillIcon className="w-7 h-7 text-marker" strokeWidth={2.5} />
    </div>
    <p className="font-body text-lg text-pencil/60">加载中...</p>
  </div>
)

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return loadingFallback
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!profile && location.pathname !== "/set-username") {
    return <Navigate to="/set-username" replace />
  }

  if (profile && location.pathname === "/set-username") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
