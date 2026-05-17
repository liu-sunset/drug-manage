import { useState } from "react"
import { Trash2Icon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDrugs } from "@/hooks/useDrugs"
import { toast } from "sonner"
import type { Drug } from "@/types"

interface DeleteDrugConfirmProps {
  drug: Drug
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDrugConfirm({ drug, open, onOpenChange }: DeleteDrugConfirmProps) {
  const { deleteDrug } = useDrugs()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await deleteDrug(drug.id)
    setLoading(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success("药物已删除")
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon className="text-marker" strokeWidth={2.5} />
          </AlertDialogMedia>
          <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作将永久删除「{drug.name}」的记录，无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
          >
            {loading ? "删除中..." : "确定删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
