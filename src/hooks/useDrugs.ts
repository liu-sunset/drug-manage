import { useContext } from "react"
import { DrugsContext } from "@/contexts/DrugsContext"

export function useDrugs() {
  const ctx = useContext(DrugsContext)
  if (!ctx) throw new Error("useDrugs 必须在 DrugsProvider 内部使用")
  return ctx
}
