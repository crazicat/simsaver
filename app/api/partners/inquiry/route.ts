import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { INQUIRY_TYPES, InquiryType } from "@/lib/partners";

// 입점·광고 문의 접수: partner_inquiries 저장 + Slack 알림.
// 둘 중 하나라도 성공하면 접수 완료로 본다.
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Slack mrkdwn 제어문자 이스케이프 */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 봇 차단용 숨김 필드 — 채워져 있으면 성공처럼 응답하고 버린다
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  const company = str(body.company, 100);
  const name = str(body.name, 50);
  const email = str(body.email, 120);
  const phone = str(body.phone, 30);
  const message = str(body.message, 2000);
  const type = (str(body.type, 20) in INQUIRY_TYPES ? str(body.type, 20) : "other") as InquiryType;

  if (!company || !name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "회사명·담당자명·이메일을 확인해 주세요." }, { status: 400 });
  }

  let saved = false;
  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin
      .from("partner_inquiries")
      .insert({ company, name, email, phone: phone || null, type, message: message || null });
    if (error) console.error("partner_inquiries insert:", error.message);
    else saved = true;
  }

  let notified = false;
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    const text =
      `:handshake: *알뜰폰갤러리 파트너 문의* — ${esc(INQUIRY_TYPES[type])}\n` +
      `*회사* ${esc(company)}\n*담당자* ${esc(name)} (${esc(email)}${phone ? ", " + esc(phone) : ""})\n` +
      (message ? `>${esc(message).replace(/\n/g, "\n>")}` : "");
    try {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      notified = r.ok;
      if (!r.ok) console.error("slack webhook:", r.status);
    } catch (e) {
      console.error("slack webhook:", (e as Error).message);
    }
  }

  if (!saved && !notified) {
    return NextResponse.json(
      { error: "일시적으로 접수할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true });
}
