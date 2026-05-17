import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDrugs } from "@/hooks/useDrugs"
import { calculateExpiryDate, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import type { Drug } from "@/types"

interface EditDrugDialogProps {
  drug: Drug
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditDrugDialog({ drug, open, onOpenChange }: EditDrugDialogProps) {
  const { updateDrug } = useDrugs()
  const [name, setName] = useState(drug.name)
  const [productionDate, setProductionDate] = useState(drug.production_date)
  const [shelfLifeDays, setShelfLifeDays] = useState(String(drug.shelf_life_days))
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const expiryPreview = productionDate && shelfLifeDays
    ? calculateExpiryDate(productionDate, parseInt(shelfLifeDays) || 0)
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) { setError("请输入药物名称"); return }
    if (!productionDate) { setError("请选择生产日期"); return }
    if (!shelfLifeDays || parseInt(shelfLifeDays) <= 0) {
      setError("请输入有效的保质期天数")
      return
    }

    setLoading(true)
    const { error: err } = await updateDrug(drug.id, {
      name: name.trim(),
      production_date: productionDate,
      shelf_life_days: parseInt(shelfLifeDays),
    })
    setLoading(false)

    if (err) {
      setError(err)
    } else {
      toast.success("药物更新成功")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen)
      if (newOpen) {
        setName(drug.name)
        setProductionDate(drug.production_date)
        setShelfLifeDays(String(drug.shelf_life_days))
        setError("")
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑药物</DialogTitle>
          <DialogDescription>修改药物信息，保质期将自动重新计算</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">药物名称</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-productionDate">生产日期</Label>
              <Input
                id="edit-productionDate"
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="h-11 text-lg block w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-shelfLife">保质期（天）</Label>
              <Input
                id="edit-shelfLife"
                type="number"
                min="1"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(e.target.value)}
                className="h-11 text-lg"
              />
            </div>

            {expiryPreview && (
              <div
                className="bg-[#fff9c4] border-[2px] border-dashed border-pencil/40 p-3 text-lg font-body"
                style={{ borderRadius: "155px 25px 135px 25px / 25px 145px 25px 135px" }}
              >
                <span className="text-pencil/60">预计过期日期：</span>
                <span className="font-bold text-pencil">{formatDate(expiryPreview)}</span>
              </div>
            )}

            {error && (
              <div className="bg-marker/10 border-[2px] border-marker p-3 text-marker font-body" style={{ borderRadius: "155px 25px 135px 25px / 25px 145px 25px 135px" }}>
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存修改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
