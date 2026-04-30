import { supabase } from "./supabase";

// ── 타입 ──────────────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  bgColor: string;
  textColor: string;
  ctaText?: string;
  linkUrl?: string;
  planId?: string;
  position: "hero" | "mid_grid" | "sidebar";
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface DbBanner {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  bg_color: string;
  text_color: string;
  cta_text: string | null;
  link_url: string | null;
  plan_id: string | null;
  position: "hero" | "mid_grid" | "sidebar";
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

function dbToBanner(row: DbBanner): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    badgeText: row.badge_text ?? undefined,
    bgColor: row.bg_color,
    textColor: row.text_color,
    ctaText: row.cta_text ?? undefined,
    linkUrl: row.link_url ?? undefined,
    planId: row.plan_id ?? undefined,
    position: row.position,
    displayOrder: row.display_order,
    isActive: row.is_active,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
  };
}

// ── 공개 조회 (anon key + RLS: 활성·기간 내만 반환) ──────────
export async function fetchActiveBanners(): Promise<Banner[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[banners] fetch error:", error.message);
    return [];
  }
  return (data as DbBanner[]).map(dbToBanner);
}
