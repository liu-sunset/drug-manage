import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PASSWORD_MIN_LENGTH } from "@/lib/utils"

export default function RegisterPage() {
  const { signUp, user, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && profile) {
      navigate("/", { replace: true })
    }
  }, [user, profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) { setError("请输入邮箱"); return }
    if (!password) { setError("请输入密码"); return }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`密码至少需要${PASSWORD_MIN_LENGTH}位字符`)
      return
    }
    if (password !== confirmPassword) { setError("两次密码不一致"); return }

    setLoading(true)
    const { error: err } = await signUp(email, password)
    setLoading(false)

    if (err) {
      toast.error(err)
    } else {
      toast.success("注册成功，请检查你的邮箱并确认验证链接")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div
        className="relative w-full max-w-md bg-white border-[3px] border-pencil shadow-hard-lg p-8 rotate-[0.3deg]"
        style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
      >
        <div className="text-center space-y-2 mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 bg-white border-[3px] border-pencil shadow-hard-sm mb-3 rotate-[2deg]"
            style={{ borderRadius: "185px 25px 155px 25px / 25px 175px 25px 165px" }}
          >
            <svg className="w-7 h-7 text-ballpoint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" />
              <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl text-pencil">创建账户</h1>
          <p className="font-body text-lg text-pencil/60">注册你的药物管理账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 text-lg"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder={`至少${PASSWORD_MIN_LENGTH}位字符`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 text-lg"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 text-lg"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="bg-marker/10 border-[2px] border-marker p-3 text-marker font-body" style={{ borderRadius: "155px 25px 135px 25px / 25px 145px 25px 135px" }}>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-xl" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>

        <p className="text-center mt-6 font-body text-lg text-pencil/60">
          已有账户？{" "}
          <Link to="/login" className="text-ballpoint font-bold hover:underline underline-offset-4">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
