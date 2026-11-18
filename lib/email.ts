import prisma from "./prisma";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Returns true on success. Without RESEND_API_KEY the email is printed to the server console. */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:dev] to=${to} subject=${subject}\n${html}\n`);
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Celestia Estates <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("Email failed:", await res.text());
    return res.ok;
  } catch (e) {
    console.error("Email error:", e);
    return false;
  }
}

/** Sends and records the attempt in email_logs. Never throws. */
export async function sendLoggedEmail(opts: {
  to: string; subject: string; html: string; template: string; userId?: bigint | null; leadId?: bigint | null;
}) {
  const ok = await sendEmail(opts.to, opts.subject, opts.html);
  await prisma.emailLog
    .create({
      data: {
        toEmail: opts.to, subject: opts.subject, template: opts.template,
        userId: opts.userId ?? null, leadId: opts.leadId ?? null,
        status: ok ? "SENT" : "FAILED", error: ok ? null : "Provider rejected the message",
      },
    })
    .catch((e) => console.error("email log failed", e));
  return ok;
}
