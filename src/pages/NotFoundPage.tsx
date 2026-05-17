import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

const scribbleSvg = (
  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
    <path
      d="M5 6 C30 2 60 10 90 6 C120 2 150 10 180 5"
      stroke="#2d2d2d"
      strokeWidth="2"
      strokeDasharray="6 3"
      strokeLinecap="round"
    />
  </svg>
)

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 rotate-[-0.5deg]">
        <div className="relative inline-block">
          <p className="font-heading text-[8rem] leading-none text-marker/30 select-none">404</p>
          {scribbleSvg}
        </div>
        <h1 className="font-heading text-3xl text-pencil">页面走丢了</h1>
        <p className="font-body text-xl text-pencil/60">你访问的页面可能已被移除或地址有误</p>
        <Button onClick={() => navigate("/")} size="lg" className="text-xl mt-4">
          返回首页
        </Button>
      </div>
    </div>
  )
}
