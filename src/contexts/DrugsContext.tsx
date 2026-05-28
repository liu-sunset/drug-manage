import { createContext, useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { calculateExpiryDate } from "@/lib/utils"
import type { Drug, NewDrugInput } from "@/types"

interface DrugsState {
  drugs: Drug[]
  loading: boolean
  error: string | null
  fetchDrugs: () => Promise<void>
  addDrug: (input: NewDrugInput) => Promise<{ error: string | null }>
  updateDrug: (id: string, input: { name?: string; production_date?: string; shelf_life_days?: number }) => Promise<{ error: string | null }>
  deleteDrug: (id: string) => Promise<{ error: string | null }>
}

export const DrugsContext = createContext<DrugsState | undefined>(undefined)

export function DrugsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDrugs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from("drugs")
      .select("*")
      .eq("user_id", user.id)
      .order("expiry_date", { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setDrugs(data as Drug[])
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchDrugs()
  }, [fetchDrugs])

  const addDrug = useCallback(async (input: NewDrugInput): Promise<{ error: string | null }> => {
    if (!user) return { error: "未登录" }
    const expiry_date = calculateExpiryDate(input.production_date, input.shelf_life_days)
    const { error: err } = await supabase.from("drugs").insert({
      user_id: user.id,
      name: input.name,
      production_date: input.production_date,
      shelf_life_days: input.shelf_life_days,
      expiry_date,
    })
    if (err) return { error: err.message }
    await fetchDrugs()
    return { error: null }
  }, [user, fetchDrugs])

  const updateDrug = useCallback(async (
    id: string,
    input: { name?: string; production_date?: string; shelf_life_days?: number }
  ): Promise<{ error: string | null }> => {
    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.production_date !== undefined) updateData.production_date = input.production_date
    if (input.shelf_life_days !== undefined) updateData.shelf_life_days = input.shelf_life_days

    if (input.production_date !== undefined || input.shelf_life_days !== undefined) {
      const drug = drugs.find((d) => d.id === id)
      const prodDate = input.production_date ?? drug?.production_date
      const shelfDays = input.shelf_life_days ?? drug?.shelf_life_days
      if (prodDate && shelfDays) {
        updateData.expiry_date = calculateExpiryDate(prodDate, shelfDays)
      }
    }

    const { error: err } = await supabase.from("drugs").update(updateData).eq("id", id)
    if (err) return { error: err.message }
    await fetchDrugs()
    return { error: null }
  }, [drugs, fetchDrugs])

  const deleteDrug = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error: err } = await supabase.from("drugs").delete().eq("id", id)
    if (err) return { error: err.message }
    await fetchDrugs()
    return { error: null }
  }, [fetchDrugs])

  const value = useMemo(() => ({
    drugs, loading, error, fetchDrugs, addDrug, updateDrug, deleteDrug,
  }), [drugs, loading, error, fetchDrugs, addDrug, updateDrug, deleteDrug])

  return (
    <DrugsContext.Provider value={value}>
      {children}
    </DrugsContext.Provider>
  )
}
