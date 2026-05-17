import { memo } from "react"
import { AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState = memo(function ErrorState({ message = "加载失败", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-20 h-20 flex items-center justify-center bg-white border-[3px] border-marker shadow-hard mb-6 rotate-[1deg]"
        style={{ borderRadius: "225px 15px 195px 15px / 15px 195px 15px 225px" }}
      >
        <AlertCircleIcon className="w-10 h-10 text-marker" strokeWidth={2.5} />
      </div>
      <h3 className="font-heading text-2xl text-pencil mb-2">出错了</h3>
      <p className="font-body text-lg text-pencil/60 mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="lg">
          重试
        </Button>
      )}
    </div>
  )
})
