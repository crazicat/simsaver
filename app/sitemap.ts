import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/seo/metadata";

export const revalidate = 3600; // 1시간마다 재생성

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date("2026-06-19"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/carriers/kt`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/carriers/skt`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/carriers/lgu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  if (!supabase) return entries;

  // PostgREST max_rows=1000 하드캡 우회: range() 로 페이지네이션.
  // (미적용 시 2,000개 이상의 요금제 중 1,000개만 사이트맵에 실림)
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("plans")
      .select("id, last_crawled_at")
      .eq("is_active", true)
      .order("last_crawled_at", { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("sitemap fetch error:", error.message);
      break;
    }
    if (!data || data.length === 0) break;

    for (const plan of data) {
      entries.push({
        url: `${SITE_URL}/plans/${plan.id}`,
        lastModified: plan.last_crawled_at ? new Date(plan.last_crawled_at) : new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    if (data.length < PAGE) break; // 마지막 페이지
  }

  return entries;
}
