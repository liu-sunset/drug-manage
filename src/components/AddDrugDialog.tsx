import { useState } from "react"
import { PlusIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDrugs } from "@/hooks/useDrugs"
import { calculateExpiryDate, formatDate } from "@/lib/utils"
import { toast } from "sonner"

export function AddDrugDialog() {
  const { addDrug } = useDrugs()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [productionDate, setProductionDate] = useState("")
  const [shelfLifeDays, setShelfLifeDays] = useState("")
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
    const { error: err } = await addDrug({
      name: name.trim(),
      production_date: productionDate,
      shelf_life_days: parseInt(shelfLifeDays),
    })
    setLoading(false)

    if (err) {
      setError(err)
    } else {
      toast.success("药物添加成功")
      setOpen(false)
      setName("")
      setProductionDate("")
      setShelfLifeDays("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="lg" className="gap-2 text-lg rotate-[1deg]">
          <PlusIcon className="w-5 h-5" strokeWidth={2.5} />
          添加药物
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加药物</DialogTitle>
          <DialogDescription>填写药物信息以开始追踪保质期</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">药物名称</Label>
              <Input
                id="name"
                placeholder="例如：阿莫西林"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionDate">生产日期</Label>
              <Input
                id="productionDate"
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="h-11 text-lg block w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shelfLife">保质期（天）</Label>
              <Input
                id="shelfLife"
                type="number"
                min="1"
                placeholder="例如：365"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "添加中..." : "确认添加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
