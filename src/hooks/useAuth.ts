import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext"

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内部使用")
  return ctx
}
