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

  const { data } = await supabase
    .from("plans")
    .select("id, last_crawled_at")
    .eq("is_active", true)
    .order("last_crawled_at", { ascending: false });

  if (data) {
    for (const plan of data) {
      entries.push({
        url: `${SITE_URL}/plans/${plan.id}`,
        lastModified: plan.last_crawled_at ? new Date(plan.last_crawled_at) : new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  return entries;
}
