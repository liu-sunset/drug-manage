import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@resend.dev"
const SB_URL = Deno.env.get("SB_URL")!
const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY)

interface ExpiringDrug {
  id: string
  name: string
  expiry_date: string
  user_id: string
  username: string
  email: string
}

Deno.serve(async (_req: Request) => {
  try {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 7)
    const targetDateStr = targetDate.toISOString().split("T")[0]

    const { data: drugs, error: queryError } = await supabase
      .from("drugs")
      .select(`
        id, name, expiry_date, user_id,
        profiles!inner(username),
        auth_users:user_id(email)
      `)
      .eq("expiry_date", targetDateStr)
      .eq("reminder_sent", false)

    if (queryError) {
      return new Response(JSON.stringify({ error: queryError.message }), { status: 500 })
    }

    if (!drugs || drugs.length === 0) {
      return new Response(JSON.stringify({ processed: 0, sent: 0, failed: 0 }), { status: 200 })
    }

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const drugRaw of drugs) {
      const drug = drugRaw as unknown as {
        id: string; name: string; expiry_date: string; user_id: string
        profiles: { username: string }[]
        auth_users: { email: string }[]
      }

      const username = drug.profiles?.[0]?.username ?? "用户"
      const email = drug.auth_users?.[0]?.email
      if (!email) { failed++; continue }

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #D34947;">药物过期提醒</h2>
          <p>尊敬的<strong>${username}</strong>，你好！</p>
          <p>你购买的药物<strong>${drug.name}</strong>即将过期，仅剩一周的保质期，请尽快重新购置！</p>
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
