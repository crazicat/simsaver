import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { addUtm } from "@/lib/plans";

// 가입 버튼 경유 라우트: 클릭을 outbound_clicks 에 기록한 뒤 통신사 가입 페이지로 302.
// 기록 실패(테이블 미생성·env 미설정)는 사용자 이동을 막지 않는다.
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SRC_VALUES = new Set(["card", "detail", "compare", "carrier"]);
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|yeti|daum|bingpreview|headless/i;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const home = new URL("/", req.url);
  if (!UUID_RE.test(params.id) || !supabase) return NextResponse.redirect(home, 302);

  const { data: plan } = await supabase
    .from("plans")
    .select("id, url, carrier_name, mvno")
    .eq("id", params.id)
    .maybeSingle();

  if (!plan?.url) return NextResponse.redirect(new URL(`/plans/${params.id}`, req.url), 302);

  const srcParam = req.nextUrl.searchParams.get("src") ?? "";
  const src = SRC_VALUES.has(srcParam) ? srcParam : "other";
  const ua = req.headers.get("user-agent") ?? "";

  const admin = getSupabaseAdmin();
  if (admin && !BOT_RE.test(ua)) {
    const { error } = await admin.from("outbound_clicks").insert({
      plan_id: plan.id,
      carrier: plan.carrier_name,
      mvno: plan.mvno,
      src,
      is_mobile: /mobile|android|iphone/i.test(ua),
    });
    if (error) console.error("outbound_clicks insert:", error.message);
  }

  const res = NextResponse.redirect(addUtm(plan.url, `gallery_${src}`), 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
