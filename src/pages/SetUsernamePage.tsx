import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { USERNAME_REGEX } from "@/lib/utils"

export default function SetUsernamePage() {
  const navigate = useNavigate()
  const { setUsername } = useAuth()
  const [username, setUsername2] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) { setError("请输入用户名"); return }
    if (username.length < 3) { setError("用户名至少需要3个字符"); return }
    if (username.length > 20) { setError("用户名不能超过20个字符"); return }
    if (!USERNAME_REGEX.test(username)) {
      setError("用户名只能包含小写字母和数字")
      return
    }

    setLoading(true)
    const { error: err } = await setUsername(username)
    setLoading(false)

    if (err) {
      toast.error(err)
    } else {
      toast.success("用户名设置成功")
      navigate("/", { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div
        className="relative w-full max-w-md bg-white border-[3px] border-pencil shadow-hard-lg p-8 rotate-[-0.2deg]"
        style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
      >
        <div className="text-center space-y-2 mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 bg-[#fff9c4] border-[3px] border-pencil shadow-hard-sm mb-3 rotate-[-2deg]"
            style={{ borderRadius: "185px 25px 155px 25px / 25px 175px 25px 165px" }}
          >
            <svg className="w-7 h-7 text-pencil" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" />
              <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl text-pencil">设置用户名</h1>
          <p className="font-body text-lg text-pencil/60">选择一个唯一的用户名</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              placeholder="例如: john123"
              value={username}
              onChange={(e) => setUsername2(e.target.value.toLowerCase())}
              className="h-11 text-lg"
              autoComplete="username"
              maxLength={20}
            />
            <p className="font-body text-sm text-pencil/50 mt-1">3-20个字符，只能使用小写字母（a-z）和数字（0-9）</p>
          </div>

          {error && (
            <div className="bg-marker/10 border-[2px] border-marker p-3 text-marker font-body" style={{ borderRadius: "155px 25px 135px 25px / 25px 145px 25px 135px" }}>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-xl" disabled={loading}>
            {loading ? "设置中..." : "确认"}
          </Button>
        </form>
      </div>
    </div>
  )
}
