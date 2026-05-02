import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { fetchPlanById, fmtFee, fmtData } from "@/lib/plans";

export const runtime = "edge";

const MVNO_BG: Record<string, string> = {
  SKT: "#e8001c",
  KT: "#f37021",
  "LGU+": "#a50034",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const plan = await fetchPlanById(params.id);

  if (!plan) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            fontFamily: "sans-serif",
            fontSize: "32px",
            color: "#9ca3af",
          }}
        >
          요금제를 찾을 수 없습니다
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const mvnoBg = MVNO_BG[plan.mvno] ?? "#1d4ed8";
  const dataStr =
    plan.data.total === "unlimited" ? "완전무제한" : fmtData(plan.data);
  const voiceStr = plan.voice === "unlimited" ? "통화 무제한" : `통화 ${plan.voice}분`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: mvnoBg,
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "#3b82f6",
            opacity: 0.1,
          }}
        />

        {/* 상단: 통신사 + 사이트명 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "48px 72px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                background: mvnoBg,
                borderRadius: "12px",
                padding: "8px 20px",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {plan.mvno}
            </div>
            {plan.network === "5G" && (
              <div
                style={{
                  background: "#2563eb",
                  borderRadius: "12px",
                  padding: "8px 20px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                5G
              </div>
            )}
            <div style={{ fontSize: "24px", color: "#94a3b8" }}>{plan.carrier}</div>
          </div>
          <div style={{ fontSize: "22px", color: "#64748b", fontWeight: "600" }}>
            알뜰폰갤러리
          </div>
        </div>

        {/* 중간: 요금제명 + 가격 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          <div
            style={{
              fontSize: "44px",
              fontWeight: "800",
              color: "#f1f5f9",
              lineHeight: 1.2,
              marginBottom: "24px",
              maxWidth: "800px",
            }}
          >
            {plan.name}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <span
              style={{
                fontSize: "80px",
                fontWeight: "900",
                color: "#60a5fa",
                lineHeight: 1,
              }}
            >
              {fmtFee(plan.monthlyFee)}
            </span>
            <span style={{ fontSize: "28px", color: "#94a3b8" }}>/월</span>
            {plan.originalFee && plan.originalFee > plan.monthlyFee && (
              <span
                style={{ fontSize: "28px", color: "#64748b", textDecoration: "line-through" }}
              >
                {fmtFee(plan.originalFee)}
              </span>
            )}
          </div>
        </div>

        {/* 하단: 스펙 3개 */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            padding: "0 72px 52px",
          }}
        >
          {[
            { label: "데이터", value: dataStr },
            { label: "통화", value: voiceStr },
            {
              label: "약정",
              value: plan.contractMonths === 0 ? "무약정" : `${plan.contractMonths}개월`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "20px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "18px", color: "#64748b" }}>{label}</span>
              <span style={{ fontSize: "26px", fontWeight: "700", color: "#e2e8f0" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
