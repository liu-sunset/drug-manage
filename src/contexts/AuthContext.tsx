import { createContext, useCallback, useEffect, useMemo, useState, useRef } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types"

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  setUsername: (username: string) => Promise<{ error: string | null }>
  deleteAccount: () => Promise<{ error: string | null }>
}

export const AuthContext = createContext<AuthState | undefined>(undefined)

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "邮箱或密码错误"
  if (message.includes("Email not confirmed")) return "邮箱未验证，请检查你的收件箱"
  if (message.includes("already registered") || message.includes("already been registered")) return "该邮箱已被注册"
  if (message.includes("Invalid email")) return "邮箱格式不正确"
  return "操作失败，请稍后重试"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const loadingTimedOut = useRef(false)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    return data as Profile | null
  }

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await fetchProfile(user.id)
    setProfile(p)
  }, [user])

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        if (timeoutId) clearTimeout(timeoutId)
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id).then((p) => {
            if (!cancelled) setProfile(p)
          })
        }
      } catch {
        // getSession failed (likely network error), leave session as null
      } finally {
        if (!cancelled) {
          if (timeoutId) clearTimeout(timeoutId)
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return
        if (cancelled) return
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          fetchProfile(session.user.id).then((p) => {
            if (!cancelled) setProfile(p)
          })
        } else {
          setProfile(null)
        }
      }
    )

    // 保底：8 秒后强制退出 loading，防止网络不通导致无限等待
    timeoutId = setTimeout(() => {
      if (!loadingTimedOut.current) {
        loadingTimedOut.current = true
        if (!cancelled) setLoading(false)
      }
    }, 8000)

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: mapAuthError(error.message) }
      return { error: null }
    } catch {
      return { error: "网络错误，请检查网络后重试" }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: mapAuthError(error.message) }
      // Supabase 出于安全考虑不会对已注册邮箱报错，但会返回空的 identities 数组
      if (data.user?.identities?.length === 0) {
        return { error: "该邮箱已被注册" }
      }
      return { error: null }
    } catch {
      return { error: "网络错误，请检查网络后重试" }
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const setUsername = useCallback(async (username: string) => {
    if (!user) return { error: "未登录" }
    try {
      const { error } = await supabase
        .from("profiles")
        .insert({ id: user.id, username })
      if (error) {
        if (error.code === "23505") return { error: "该用户名已被占用" }
        return { error: error.message }
      }
      await refreshProfile()
      return { error: null }
    } catch {
      return { error: "网络错误，请检查网络后重试" }
    }
  }, [user, refreshProfile])

  const deleteAccount = useCallback(async () => {
    if (!session?.access_token) return { error: "未登录" }

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`

    try {
      const res = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })

      const body = await res.json() as { success?: boolean; error?: string }

      if (!res.ok || body.error) {
        return { error: body.error || "注销失败，请稍后重试" }
      }

      setProfile(null)
      setUser(null)
      setSession(null)
      return { error: null }
    } catch {
      return { error: "网络错误，请检查网络后重试" }
    }
  }, [session?.access_token])

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    setUsername,
    deleteAccount,
  }), [session, user, profile, loading, signIn, signUp, signOut, refreshProfile, setUsername, deleteAccount])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
