import { memo } from "react"
import { PencilIcon, Trash2Icon, CalendarIcon, ClockIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, getExpiryStatus } from "@/lib/utils"
import type { Drug } from "@/types"

interface DrugCardProps {
  drug: Drug
  onEdit: () => void
  onDelete: () => void
}

const statusConfig = {
  expired: { label: "已过期", className: "bg-marker text-white border-marker" },
  urgent: { label: "即将过期", className: "bg-marker text-white border-marker" },
  warning: { label: "临近过期", className: "bg-[#fff9c4] text-pencil border-pencil" },
  safe: { label: "安全", className: "bg-white text-pencil border-pencil" },
}

export const DrugCard = memo(function DrugCard({ drug, onEdit, onDelete }: DrugCardProps) {
  const status = getExpiryStatus(drug.expiry_date)
  const conf = statusConfig[status]

  return (
    <div
      className="group relative p-4 sm:p-5 bg-white border-[3px] border-pencil shadow-hard-sm hover:shadow-hard transition-all duration-150 hover:-rotate-[0.5deg]"
      style={{ borderRadius: "225px 15px 195px 15px / 15px 195px 15px 225px" }}
    >
      {/* Tape decoration */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#e5e0d8]/60 rotate-[2deg] hidden sm:block"
        style={{ borderRadius: "4px" }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-heading text-lg text-pencil truncate">{drug.name}</h3>
            <Badge variant="outline" className={`text-xs font-body ${conf.className}`}>
              {conf.label}
            </Badge>
          </div>

          <div className="space-y-1.5 font-body text-base">
            <div className="flex items-center gap-2 text-pencil/70">
              <CalendarIcon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>生产日期：{formatDate(drug.production_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-pencil/70">
              <ClockIcon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>保质期：{drug.shelf_life_days} 天</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <CalendarIcon
                className="w-4 h-4 shrink-0"
                strokeWidth={2.5}
                style={{ color: status === "expired" || status === "urgent" ? "#ff4d4d" : "#2d2d2d" }}
              />
              <span className={status === "expired" || status === "urgent" ? "text-marker" : "text-pencil"}>
                过期日期：{formatDate(drug.expiry_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <PencilIcon className="w-4 h-4" strokeWidth={2.5} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2Icon className="w-4 h-4 text-marker" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  )
})
