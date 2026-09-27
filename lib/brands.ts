import { Plan } from "./types";

/**
 * 통신사명 → 브랜드 묶음.
 * 크롤러는 다망 브랜드를 "이야기모바일(SKT)" 처럼 망별로 저장하고, 표기 흔들림
 * ("에르엘모바일" / "에르엘 모바일")도 있어 괄호·공백을 떼어낸 키로 묶는다.
 */
export function brandKey(carrier: string): string {
  return carrier.split("(")[0].replace(/\s+/g, "").trim();
}

export interface Brand {
  key: string;          // URL 슬러그 (한글 그대로, 링크 시 encodeURIComponent)
  name: string;         // 표시명 (가장 많이 쓰인 표기, 괄호 앞부분)
  plans: Plan[];        // 월요금 오름차순
  networks: Array<Plan["mvno"]>;
  minFee: number;
  has5G: boolean;
}

export function groupBrands(plans: Plan[]): Brand[] {
  const map = new Map<string, Plan[]>();
  for (const p of plans) {
    const k = brandKey(p.carrier);
    if (!k) continue;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(p);
  }

  const brands: Brand[] = [];
  for (const [key, list] of Array.from(map.entries())) {
    const names = new Map<string, number>();
    for (const p of list) {
      const n = p.carrier.split("(")[0].trim();
      names.set(n, (names.get(n) ?? 0) + 1);
    }
    const name = Array.from(names.entries()).sort((a, b) => b[1] - a[1])[0][0];
    const sorted = [...list].sort((a, b) => a.monthlyFee - b.monthlyFee);
    const order: Array<Plan["mvno"]> = ["SKT", "KT", "LGU+"];
    brands.push({
      key,
      name,
      plans: sorted,
      networks: order.filter((m) => list.some((p) => p.mvno === m)),
      minFee: sorted[0]?.monthlyFee ?? 0,
      has5G: list.some((p) => p.network === "5G"),
    });
  }
  return brands.sort((a, b) => b.plans.length - a.plans.length);
}

export function brandPath(key: string): string {
  return `/brands/${encodeURIComponent(key)}`;
}
