import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@resend.dev"
const SB_URL = Deno.env.get("SB_URL")!
const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY)

Deno.serve(async (_req: Request) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split("T")[0]

    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 7)
    const maxDateStr = maxDate.toISOString().split("T")[0]

    const { data: drugs, error: queryError } = await supabase
      .from("drugs")
      .select("id, name, expiry_date, user_id")
      .gte("expiry_date", todayStr)
      .lte("expiry_date", maxDateStr)
      .eq("reminder_sent", false)

    if (queryError) {
      return new Response(JSON.stringify({ error: queryError.message }), { status: 500 })
    }

    if (!drugs || drugs.length === 0) {
      return new Response(JSON.stringify({ processed: 0, sent: 0, failed: 0 }), { status: 200 })
    }

    const userIds = [...new Set(drugs.map((d) => d.user_id))]

    // 并行获取 profiles 和 users
    const [{ data: profiles }, { data: users }] = await Promise.all([
      supabase.from("profiles").select("id, username").in("id", userIds),
      supabase.schema("auth").from("users").select("id, email").in("id", userIds),
    ])

    // 构建查找 Map
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.username]))
    const emailMap = new Map((users ?? []).map((u) => [u.id, u.email]))

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const drug of drugs) {
      const username = profileMap.get(drug.user_id) ?? "用户"
      const email = emailMap.get(drug.user_id)
      if (!email) { failed++; continue }

      const expiry = new Date(drug.expiry_date)
      expiry.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const daysText = daysLeft <= 0 ? "已过期" : `仅剩 ${daysLeft} 天`

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #D34947;">药物过期提醒</h2>
          <p>尊敬的<strong>${username}</strong>，你好！</p>
          <p>你购买的药物<strong>${drug.name}</strong>（过期日期 ${drug.expiry_date}）${daysText}，请尽快重新购置！</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">此邮件由药物管理系统自动发送</p>
        </div>`

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `药物管理 <${SENDER_EMAIL}>`,
            to: [email],
            subject: `药物过期提醒 - ${drug.name}`,
            html: htmlBody,
          }),
        })

        if (res.ok) {
          await supabase.from("drugs").update({ reminder_sent: true }).eq("id", drug.id)
          sent++
        } else {
          const body = await res.text()
          errors.push(`发送给 ${email} 失败: ${body}`)
          failed++
        }
      } catch (err) {
        errors.push(`发送给 ${email} 异常: ${String(err)}`)
        failed++
      }
    }

    return new Response(
      JSON.stringify({ processed: drugs.length, sent, failed, errors: errors.slice(0, 10) }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
