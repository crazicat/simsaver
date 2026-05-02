import { supabase } from "@/lib/supabase";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo/metadata";

export const revalidate = 3600; // 1시간

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  let items = "";

  if (supabase) {
    const { data } = await supabase
      .from("plans")
      .select("id, name, carrier_name, monthly_fee, last_crawled_at, data_mb, data_unlimited, network, mvno")
      .eq("is_active", true)
      .order("last_crawled_at", { ascending: false })
      .limit(50);

    if (data) {
      items = data
        .map((plan) => {
          const url = `${SITE_URL}/plans/${plan.id}`;
          const feeStr = plan.monthly_fee.toLocaleString("ko-KR");
          const dataStr = plan.data_unlimited
            ? "완전무제한"
            : plan.data_mb
            ? plan.data_mb >= 1024
              ? `${(plan.data_mb / 1024).toFixed(1).replace(/\.0$/, "")}GB`
              : `${plan.data_mb}MB`
            : "-";
          const title = escapeXml(
            `${plan.name} — ${plan.carrier_name} 월 ${feeStr}원 / ${dataStr}`
          );
          const desc = escapeXml(
            `${plan.carrier_name}의 ${plan.name} 요금제. 월 ${feeStr}원, 데이터 ${dataStr}, ${plan.mvno}망 ${plan.network}.`
          );
          const pubDate = plan.last_crawled_at
            ? new Date(plan.last_crawled_at).toUTCString()
            : new Date().toUTCString();

          return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
        })
        .join("\n");
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
