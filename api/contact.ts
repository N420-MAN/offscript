/**
 * Contact form endpoint (Vercel serverless function, no dependencies).
 * Sends the message through Resend's REST API. Required environment variables:
 *   RESEND_API_KEY   your Resend API key
 *   CONTACT_TO       where inquiries are delivered (e.g. the studio's inbox)
 *   CONTACT_FROM     a sender on a domain verified in Resend, e.g. "OFFSCRIPT <contact@offscript.ma>"
 * On other hosts (Netlify, Cloudflare), port this handler; the browser only needs POST JSON -> { ok: true }.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const hits = new Map<string, number[]>()

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Méthode non autorisée.' })

  // light per-instance rate limit: 5 requests / 10 minutes / IP
  const ip = String(req.headers['x-forwarded-for'] ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000)
  if (recent.length >= 5) return res.status(429).json({ ok: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' })
  hits.set(ip, [...recent, now])

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
  const s = (k: string, max: number) => String(b[k] ?? '').trim().slice(0, max)
  const name = s('name', 120)
  const company = s('company', 160)
  const email = s('email', 200)
  const phone = s('phone', 40)
  const type = s('type', 80)
  const budget = s('budget', 80)
  const message = s('message', 3000)

  if (b.website) return res.status(200).json({ ok: true }) // honeypot: pretend success to bots
  if (name.length < 2 || company.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !type || message.length < 20) {
    return res.status(400).json({ ok: false, error: 'Certains champs sont invalides.' })
  }
  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) return res.status(500).json({ ok: false, error: 'L’envoi n’est pas encore configuré.' })

  const rows: [string, string][] = [['Nom', name], ['Entreprise', company], ['E-mail', email], ['Téléphone', phone || '—'], ['Type de projet', type], ['Budget indicatif', budget || '—']]
  const html = `<h2>Nouvelle demande de projet</h2>${rows.map(([k, v]) => `<p><b>${k} :</b> ${esc(v)}</p>`).join('')}<p><b>Besoin :</b></p><p style="white-space:pre-wrap">${esc(message)}</p>`
  const text = rows.map(([k, v]) => `${k} : ${v}`).join('\n') + `\n\n${message}`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: CONTACT_FROM, to: [CONTACT_TO], reply_to: email, subject: `Nouvelle demande — ${company} (${type})`, html, text }),
    })
    if (!r.ok) return res.status(502).json({ ok: false, error: 'Le service d’envoi a refusé le message.' })
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(502).json({ ok: false, error: 'Service d’envoi injoignable.' })
  }
}
