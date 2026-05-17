import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AppLayout } from "@/components/AppLayout"
import { LoadingSkeleton } from "@/components/LoadingSkeleton"

const LoginPage = lazy(() => import("@/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/pages/RegisterPage"))
const SetUsernamePage = lazy(() => import("@/pages/SetUsernamePage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSkeleton />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/set-username" element={<SetUsernamePage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
