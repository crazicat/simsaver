import { Plan, FilterState, SortKey } from "./types";
import { supabase } from "./supabase";

// ── Supabase DB row 타입 ──────────────────────────────────
interface DbPlan {
  id: string;
  carrier_name: string;
  mvno: "SKT" | "KT" | "LGU+";
  network: "LTE" | "5G";
  name: string;
  monthly_fee: number;
  data_mb: number | null;
  data_unlimited: boolean;
  throttled_speed: number | null;
  voice_unlimited: boolean;
  voice_min: number | null;
  sms_unlimited: boolean;
  sms_cnt?: number | null;
  benefits: string[];
  contract_months: number;
  url: string | null;
  last_crawled_at: string;
  // 프로모션 (옵셔널 — migration 적용 전에는 undefined)
  original_fee?: number | null;
  promo_months?: number | null;
  promo_text?: string | null;
}

// carrier_name → mvno 매핑
function toMvno(carrier: string): "SKT" | "KT" | "LGU+" {
  if (carrier.includes("U+") || carrier.includes("LG") || carrier.includes("우리")) return "LGU+";
  if (carrier.includes("KT") || carrier.includes("kt") || carrier.includes("핀다")) return "KT";
  return "SKT";
}

// DB row → Plan 변환
function dbToPlan(row: DbPlan): Plan {
  return {
    id: row.id,
    carrier: row.carrier_name,
    mvno: row.mvno ?? toMvno(row.carrier_name),
    network: row.network,
    name: row.name,
    monthlyFee: row.monthly_fee,
    data: row.data_unlimited
      ? { total: "unlimited" }
      : { total: row.data_mb ?? 0, throttledSpeed: row.throttled_speed ?? undefined },
    voice: row.voice_unlimited ? "unlimited" : (row.voice_min ?? 0),
    sms: row.sms_unlimited ? "unlimited" : (row.sms_cnt ?? 0),
    benefits: row.benefits ?? [],
    contractMonths: row.contract_months,
    url: row.url ?? undefined,
    lastUpdated: row.last_crawled_at
      ? row.last_crawled_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    originalFee: row.original_fee ?? undefined,
    promoMonths: row.promo_months ?? undefined,
    promoText: row.promo_text ?? undefined,
  };
}

// DB에서 활성 요금제 목록 가져오기
export async function fetchPlansFromDb(): Promise<Plan[]> {
  if (!supabase) {
    console.warn("Supabase 환경변수 미설정 — 목업 사용");
    return MOCK_PLANS;
  }

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("monthly_fee", { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return MOCK_PLANS;
  }

  if (!data || data.length === 0) {
    return MOCK_PLANS;
  }

  return (data as DbPlan[]).map(dbToPlan);
}

export const MOCK_PLANS: Plan[] = [
  {
    id: "1", carrier: "KT M모바일", mvno: "KT", network: "LTE",
    name: "데이터 11GB+", monthlyFee: 19800,
    data: { total: 11264, throttledSpeed: 400 },
    voice: "unlimited", sms: "unlimited",
    benefits: ["데이터 소진 후 400Kbps", "유심비 무료"],
    contractMonths: 0, lastUpdated: "2026-04-10",
  },
  {
    id: "2", carrier: "U+알뜰모바일", mvno: "LGU+", network: "5G",
    name: "5G 완전무제한", monthlyFee: 32000,
    data: { total: "unlimited" },
    voice: "unlimited", sms: "unlimited",
    benefits: ["완전 무제한", "넷플릭스 제휴 할인"],
    contractMonths: 12, lastUpdated: "2026-04-09",
  },
  {
    id: "3", carrier: "스노우맨", mvno: "SKT", network: "LTE",
    name: "알뜰 기본형", monthlyFee: 9900,
    data: { total: 3072, throttledSpeed: 200 },
    voice: 100, sms: 100,
    benefits: ["유심비 4,400원"],
    contractMonths: 0, lastUpdated: "2026-04-08",
  },
  {
    id: "4", carrier: "LG헬로모바일", mvno: "LGU+", network: "LTE",
    name: "통화+데이터 20GB", monthlyFee: 24900,
    data: { total: 20480, throttledSpeed: 400 },
    voice: "unlimited", sms: "unlimited",
    benefits: ["데이터 소진 후 400Kbps", "첫달 50% 할인"],
    contractMonths: 6, lastUpdated: "2026-04-10",
  },
  {
    id: "5", carrier: "아이즈모바일", mvno: "KT", network: "LTE",
    name: "슬림 5GB", monthlyFee: 13900,
    data: { total: 5120, throttledSpeed: 400 },
    voice: "unlimited", sms: "unlimited",
    benefits: ["무약정", "즉시 개통"],
    contractMonths: 0, lastUpdated: "2026-04-07",
  },
  {
    id: "6", carrier: "프리텔레콤", mvno: "SKT", network: "5G",
    name: "5G 프리미엄 50GB", monthlyFee: 39000,
    data: { total: 51200, throttledSpeed: 5000 },
    voice: "unlimited", sms: "unlimited",
    benefits: ["5G 지원", "소진 후 5Mbps", "쿠팡 제휴"],
    contractMonths: 24, lastUpdated: "2026-04-06",
  },
  {
    id: "7", carrier: "티플러스", mvno: "SKT", network: "LTE",
    name: "무제한 기본", monthlyFee: 27500,
    data: { total: "unlimited" },
    voice: "unlimited", sms: "unlimited",
    benefits: ["완전무제한", "약정 없음"],
    contractMonths: 0, lastUpdated: "2026-04-10",
  },
  {
    id: "8", carrier: "KT M모바일", mvno: "KT", network: "LTE",
    name: "데이터 33GB", monthlyFee: 29900,
    data: { total: 33792, throttledSpeed: 400 },
    voice: "unlimited", sms: "unlimited",
    benefits: ["33GB 후 400Kbps", "해외로밍 지원"],
    contractMonths: 12, lastUpdated: "2026-04-10",
  },
  {
    id: "9", carrier: "스노우맨", mvno: "SKT", network: "LTE",
    name: "데이터 중형 15GB", monthlyFee: 17600,
    data: { total: 15360, throttledSpeed: 400 },
    voice: "unlimited", sms: "unlimited",
    benefits: ["무약정", "15GB 후 400Kbps"],
    contractMonths: 0, lastUpdated: "2026-04-09",
  },
  {
    id: "10", carrier: "U+알뜰모바일", mvno: "LGU+", network: "LTE",
    name: "알뜰 통화무제한", monthlyFee: 11000,
    data: { total: 1024, throttledSpeed: 200 },
    voice: "unlimited", sms: "unlimited",
    benefits: ["통화 무제한", "저렴한 데이터"],
    contractMonths: 0, lastUpdated: "2026-04-08",
  },
];

// ── 포맷 유틸 ──────────────────────────────────────────
export function fmtFee(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export function fmtData(d: Plan["data"]) {
  if (d.total === "unlimited") return "완전무제한";
  const gb = d.total / 1024;
  if (gb < 1) return `${d.total}MB`;
  return `${gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)}GB`;
}

export function fmtVoice(v: number | "unlimited") {
  if (v === "unlimited") return "무제한";
  if (v > 0) return `${v}분`;
  return "-";
}

export function fmtSms(v: number | "unlimited") {
  if (v === "unlimited") return "무제한";
  if (v > 0) return `${v}건`;
  return "-";
}

export function fmtThrottle(kbps: number) {
  if (kbps >= 1000) {
    const mbps = kbps / 1000;
    return `${mbps % 1 === 0 ? mbps.toFixed(0) : mbps.toFixed(1)}Mbps`;
  }
  return `${kbps}Kbps`;
}

export function fmtContract(months: number) {
  return months === 0 ? "무약정" : `${months}개월`;
}

export function dataToGb(d: Plan["data"]): number {
  return d.total === "unlimited" ? Infinity : d.total / 1024;
}

// ── 필터 & 정렬 ────────────────────────────────────────
export function filterAndSort(
  plans: Plan[],
  filters: FilterState,
  sort: SortKey
): Plan[] {
  const result = plans.filter((p) => {
    if (
      filters.search &&
      !p.carrier.includes(filters.search) &&
      !p.name.includes(filters.search)
    )
      return false;
    if (filters.mvno.length && !filters.mvno.includes(p.mvno)) return false;
    if (p.monthlyFee > filters.maxFee) return false;
    if (dataToGb(p.data) < filters.minDataGb) return false;
    if (filters.unlimitedVoice && p.voice !== "unlimited") return false;
    if (filters.noContract && p.contractMonths !== 0) return false;
    if (filters.network !== "ALL" && p.network !== filters.network) return false;
    return true;
  });

  return result.sort((a, b) => {
    switch (sort) {
      case "fee_asc":  return a.monthlyFee - b.monthlyFee;
      case "fee_desc": return b.monthlyFee - a.monthlyFee;
      case "data_desc":
        return dataToGb(b.data) - dataToGb(a.data);
      case "updated":
        return (
          new Date(b.lastUpdated).getTime() -
          new Date(a.lastUpdated).getTime()
        );
      default: return 0;
    }
  });
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  mvno: [],
  maxFee: 50000,
  minDataGb: 0,
  unlimitedVoice: false,
  noContract: false,
  network: "ALL",
};
