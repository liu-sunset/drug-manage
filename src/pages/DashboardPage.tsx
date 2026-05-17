import { useState, useCallback, lazy, Suspense } from "react"
import { useDrugs } from "@/hooks/useDrugs"
import { DrugCard } from "@/components/DrugCard"
import { AddDrugDialog } from "@/components/AddDrugDialog"
import { EmptyState } from "@/components/EmptyState"
import { ErrorState } from "@/components/ErrorState"
import { LoadingSkeleton } from "@/components/LoadingSkeleton"
import type { Drug } from "@/types"

const EditDrugDialog = lazy(() => import("@/components/EditDrugDialog").then(m => ({ default: m.EditDrugDialog })))
const DeleteDrugConfirm = lazy(() => import("@/components/DeleteDrugConfirm").then(m => ({ default: m.DeleteDrugConfirm })))

export default function DashboardPage() {
  const { drugs, loading, error, fetchDrugs } = useDrugs()
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null)
  const [deletingDrug, setDeletingDrug] = useState<Drug | null>(null)

  const handleEdit = useCallback((drug: Drug) => setEditingDrug(drug), [])
  const handleDelete = useCallback((drug: Drug) => setDeletingDrug(drug), [])
  const handleEditClose = useCallback((open: boolean) => { if (!open) setEditingDrug(null) }, [])
  const handleDeleteClose = useCallback((open: boolean) => { if (!open) setDeletingDrug(null) }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="rotate-[-0.5deg]">
          <h1 className="font-heading text-3xl sm:text-4xl text-pencil">我的药物</h1>
          <p className="font-body text-lg text-pencil/60 mt-1">
            {loading ? "加载中..." : `共 ${drugs.length} 种药物`}
          </p>
        </div>
        <AddDrugDialog />
      </div>

      {loading && <LoadingSkeleton />}
      {!loading && error && <ErrorState message={error} onRetry={fetchDrugs} />}
      {!loading && !error && drugs.length === 0 && <EmptyState />}
      {!loading && !error && drugs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drugs.map((drug) => (
            <DrugCard
              key={drug.id}
              drug={drug}
              onEdit={() => handleEdit(drug)}
              onDelete={() => handleDelete(drug)}
            />
          ))}
        </div>
      )}

      {editingDrug && (
        <Suspense fallback={null}>
          <EditDrugDialog
            drug={editingDrug}
            open={!!editingDrug}
            onOpenChange={handleEditClose}
          />
        </Suspense>
      )}

      {deletingDrug && (
        <Suspense fallback={null}>
          <DeleteDrugConfirm
            drug={deletingDrug}
            open={!!deletingDrug}
            onOpenChange={handleDeleteClose}
          />
        </Suspense>
      )}
    </div>
  )
}
