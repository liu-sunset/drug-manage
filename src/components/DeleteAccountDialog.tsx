import { useState } from "react"
import { UserXIcon } from "lucide-react"
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
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { deleteAccount } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await deleteAccount()
    setLoading(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success("账户已注销")
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <UserXIcon className="text-marker" strokeWidth={2.5} />
          </AlertDialogMedia>
          <AlertDialogTitle>确定要注销账户吗？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作将永久删除你的账户、所有药物记录和相关数据，且无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
          >
            {loading ? "注销中..." : "确定注销"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
