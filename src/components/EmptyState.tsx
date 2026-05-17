import { memo } from "react"
import { PillIcon } from "lucide-react"

const pillIconContainer = (
  <div
    className="relative w-20 h-20 flex items-center justify-center bg-white border-[3px] border-pencil shadow-hard mb-6 rotate-[-2deg]"
    style={{ borderRadius: "225px 15px 195px 15px / 15px 195px 15px 225px" }}
  >
    <PillIcon className="w-10 h-10 text-marker/50" strokeWidth={2} />
  </div>
)

const arrowSvg = (
  <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="rotate-[8deg]">
    <path
      d="M30 38 C28 25 25 15 30 5"
      stroke="#2d2d2d"
      strokeWidth="2"
      strokeDasharray="4 3"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M22 12 L30 5 L38 12" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {pillIconContainer}
      <div className="hidden sm:block relative -mt-2 mb-2">
        {arrowSvg}
      </div>
      <h3 className="font-heading text-2xl text-pencil mb-2">还没有添加任何药物</h3>
      <p className="font-body text-lg text-pencil/60 max-w-xs">
        点击上方「添加药物」按钮
        <br />
        开始记录你的药物信息吧
      </p>
    </div>
  )
})
