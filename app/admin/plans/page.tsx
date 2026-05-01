"use client";
import React, { useState, useEffect, useCallback } from "react";

// ── 타입 ──────────────────────────────────────────────────────────
interface PlanRow {
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
  sms_cnt: number | null;
  benefits: string[];
  contract_months: number;
  url: string | null;
  is_active: boolean;
  original_fee: number | null;
  promo_months: number | null;
  promo_text: string | null;
  last_crawled_at: string;
}

type FormData = Omit<PlanRow, "id" | "last_crawled_at">;

const EMPTY_FORM: FormData = {
  carrier_name: "",
  mvno: "SKT",
  network: "LTE",
  name: "",
  monthly_fee: 0,
  data_mb: null,
  data_unlimited: false,
  throttled_speed: null,
  voice_unlimited: true,
  voice_min: null,
  sms_unlimited: true,
  sms_cnt: null,
  benefits: [],
  contract_months: 0,
  url: null,
  is_active: true,
  original_fee: null,
  promo_months: null,
  promo_text: null,
};

// ── 스타일 상수 ───────────────────────────────────────────────────
const MVNO_BADGE: Record<string, string> = {
  SKT:   "bg-red-100 text-red-700",
  KT:    "bg-amber-100 text-amber-700",
  "LGU+":"bg-purple-100 text-purple-700",
};
const NET_BADGE: Record<string, string> = {
  LTE: "bg-blue-100 text-blue-700",
  "5G":"bg-emerald-100 text-emerald-700",
};

// ── 유틸 ─────────────────────────────────────────────────────────
function fmtFee(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}
function fmtData(p: PlanRow) {
  if (p.data_unlimited) return "무제한";
  if (!p.data_mb) return "-";
  const gb = p.data_mb / 1024;
  return gb < 1 ? `${p.data_mb}MB` : `${gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)}GB`;
}
function fmtSpeed(kbps: number | null) {
  if (!kbps) return null;
  return kbps >= 1000
    ? `${(kbps / 1000) % 1 === 0 ? (kbps / 1000).toFixed(0) : (kbps / 1000).toFixed(1)}Mbps`
    : `${kbps}Kbps`;
}

// ── 혜택 태그 에디터 ──────────────────────────────────────────────
function BenefitEditor({
  benefits,
  onChange,
}: {
  benefits: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !benefits.includes(v)) {
      onChange([...benefits, v]);
      setInput("");
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {benefits.map((b, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-xs bg-gray-100
                       text-gray-700 px-2.5 py-1 rounded-full"
          >
            {b}
            <button
              type="button"
              onClick={() => onChange(benefits.filter((_, j) => j !== i))}
              className="text-gray-400 hover:text-red-500 leading-none font-bold"
            >
              ×
            </button>
          </span>
        ))}
        {benefits.length === 0 && (
          <span className="text-xs text-gray-300">혜택 없음</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="혜택 입력 후 Enter 또는 추가 버튼"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs
                     outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={add}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200
                     rounded-xl font-medium transition-colors"
        >
          추가
        </button>
      </div>
    </div>
  );
}

// ── 입력 공통 클래스 ──────────────────────────────────────────────
const INPUT =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500";
const SELECT =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white";
const LABEL = "block text-xs text-gray-500 font-medium mb-1";
const SECTION_TITLE =
  "text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 " +
  "after:content-[''] after:flex-1 after:h-px after:bg-gray-100";

const LIMIT = 50;

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export default function PlansAdminPage() {
  const [plans, setPlans]     = useState<PlanRow[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]   = useState("");
  const [mvnoFilter, setMvnoFilter]   = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // 편집 모달
  const [editPlan, setEditPlan] = useState<PlanRow | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [form, setForm]       = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  // ── 검색 디바운스 ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── 데이터 로드 ──────────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
      });
      if (search)      params.set("search", search);
      if (mvnoFilter)  params.set("mvno",   mvnoFilter);
      if (activeFilter) params.set("active", activeFilter);

      const res = await fetch(`/api/admin/plans?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPlans(json.data ?? []);
      setTotal(json.count ?? 0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, search, mvnoFilter, activeFilter]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  // ── 편집 열기 ────────────────────────────────────────────────
  function openEdit(p: PlanRow) {
    setIsNew(false);
    setEditPlan(p);
    setForm({
      carrier_name: p.carrier_name,
      mvno: p.mvno,
      network: p.network,
      name: p.name,
      monthly_fee: p.monthly_fee,
      data_mb: p.data_mb,
      data_unlimited: p.data_unlimited,
      throttled_speed: p.throttled_speed,
      voice_unlimited: p.voice_unlimited,
      voice_min: p.voice_min,
      sms_unlimited: p.sms_unlimited,
      sms_cnt: p.sms_cnt,
      benefits: [...(p.benefits ?? [])],
      contract_months: p.contract_months,
      url: p.url,
      is_active: p.is_active,
      original_fee: p.original_fee,
      promo_months: p.promo_months,
      promo_text: p.promo_text,
    });
  }

  function openNew() {
    setIsNew(true);
    setEditPlan(null);
    setForm({ ...EMPTY_FORM });
  }

  function closeModal() {
    setEditPlan(null);
    setIsNew(false);
  }

  // ── 저장 ─────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url    = isNew ? "/api/admin/plans" : `/api/admin/plans?id=${editPlan!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      closeModal();
      await loadPlans();
      await fetch("/api/admin/revalidate", { method: "POST" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── 활성 토글 ────────────────────────────────────────────────
  async function handleToggle(p: PlanRow) {
    try {
      const res = await fetch(`/api/admin/plans?id=${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !p.is_active }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadPlans();
      await fetch("/api/admin/revalidate", { method: "POST" });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // ── setForm 헬퍼 ─────────────────────────────────────────────
  const sf = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));

  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-bold text-brand-800">알뜰폰갤러리</a>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              관리자
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <a href="/admin"
               className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              배너 관리
            </a>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-semibold">
              요금제 관리
            </span>
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600 ml-2">← 메인으로</a>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3
                          rounded-xl flex items-center justify-between">
            {error}
            <button onClick={() => setError("")} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* 검색 / 필터 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔍  통신사명 또는 요금제명 검색…"
              className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-2
                         text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />

            {/* MVNO 필터 */}
            <div className="flex gap-1">
              {(["", "SKT", "KT", "LGU+"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => { setMvnoFilter(v); setPage(1); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                    ${mvnoFilter === v
                      ? "bg-brand-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {v || "전체망"}
                </button>
              ))}
            </div>

            {/* 활성 필터 */}
            <div className="flex gap-1">
              {([["", "전체"], ["true", "활성"], ["false", "비활성"]] as const).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => { setActiveFilter(v); setPage(1); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                    ${activeFilter === v
                      ? "bg-brand-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={openNew}
              className="text-xs px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white
                         rounded-xl font-semibold transition-colors ml-auto"
            >
              + 요금제 등록
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2.5">
            총{" "}
            <span className="font-semibold text-gray-700">{total.toLocaleString()}</span>개
            {loading && <span className="ml-2 animate-pulse">불러오는 중…</span>}
          </p>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 font-semibold">
                  <th className="text-left px-4 py-3">통신사</th>
                  <th className="text-left px-4 py-3">요금제명</th>
                  <th className="text-center px-4 py-3">망</th>
                  <th className="text-right px-4 py-3">월요금</th>
                  <th className="text-left px-4 py-3">데이터</th>
                  <th className="text-left px-4 py-3">통화</th>
                  <th className="text-center px-4 py-3">약정</th>
                  <th className="text-center px-4 py-3">URL</th>
                  <th className="text-center px-4 py-3">상태</th>
                  <th className="text-center px-4 py-3">수정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-gray-400">
                      불러오는 중…
                    </td>
                  </tr>
                )}
                {!loading && plans.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
                {plans.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50 transition-colors ${!p.is_active ? "opacity-40" : ""}`}
                  >
                    {/* 통신사 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${MVNO_BADGE[p.mvno]}`}>
                          {p.mvno}
                        </span>
                        <span className="text-xs text-gray-700 font-medium truncate max-w-[80px]">
                          {p.carrier_name}
                        </span>
                      </div>
                    </td>
                    {/* 요금제명 */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="text-xs text-gray-800 line-clamp-2">{p.name}</span>
                      {p.promo_text && (
                        <span className="block text-[10px] text-rose-500 font-medium mt-0.5">
                          {p.promo_text}
                        </span>
                      )}
                    </td>
                    {/* 망 */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${NET_BADGE[p.network]}`}>
                        {p.network}
                      </span>
                    </td>
                    {/* 월요금 */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-bold text-gray-800">{fmtFee(p.monthly_fee)}</span>
                      {p.original_fee && (
                        <span className="block text-[10px] text-gray-400 line-through">
                          {fmtFee(p.original_fee)}
                        </span>
                      )}
                    </td>
                    {/* 데이터 */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-700">{fmtData(p)}</span>
                      {p.throttled_speed && (
                        <span className="block text-[10px] text-gray-400">
                          후 {fmtSpeed(p.throttled_speed)}
                        </span>
                      )}
                    </td>
                    {/* 통화 */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-700">
                        {p.voice_unlimited ? "무제한" : p.voice_min ? `${p.voice_min}분` : "-"}
                      </span>
                    </td>
                    {/* 약정 */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500">
                        {p.contract_months === 0 ? "무약정" : `${p.contract_months}개월`}
                      </span>
                    </td>
                    {/* URL */}
                    <td className="px-4 py-3 text-center">
                      {p.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-800 text-xs font-bold"
                          title={p.url}
                        >
                          ✓
                        </a>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    {/* 상태 */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(p)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors
                          ${p.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {p.is_active ? "활성" : "비활성"}
                      </button>
                    </td>
                    {/* 수정 */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600
                                   hover:bg-blue-100 font-medium transition-colors"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3
                            border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200
                           disabled:opacity-40 hover:bg-gray-100 transition-colors font-medium"
              >
                ← 이전
              </button>
              <span className="text-xs text-gray-500">
                {page} / {totalPages} 페이지
                <span className="text-gray-400 ml-1">({total.toLocaleString()}개)</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200
                           disabled:opacity-40 hover:bg-gray-100 transition-colors font-medium"
              >
                다음 →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── 편집 모달 ─────────────────────────────────────────────── */}
      {(editPlan !== null || isNew) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
                          max-h-[92vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4
                            border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="font-bold text-gray-800">
                  {isNew ? "새 요금제 등록" : "요금제 수정"}
                </h2>
                {!isNew && editPlan && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editPlan.carrier_name} · {editPlan.name}
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* 모달 바디 */}
            <form
              onSubmit={handleSave}
              className="overflow-y-auto flex-1 px-6 py-5 space-y-6"
            >
              {/* ── 기본 정보 ── */}
              <section>
                <p className={SECTION_TITLE}>기본 정보</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>통신사명 *</label>
                    <input
                      value={form.carrier_name}
                      onChange={(e) => sf({ carrier_name: e.target.value })}
                      required
                      className={INPUT}
                      placeholder="예: KT M모바일"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>요금제명 *</label>
                    <input
                      value={form.name}
                      onChange={(e) => sf({ name: e.target.value })}
                      required
                      className={INPUT}
                      placeholder="예: 데이터 11GB+"
                    />
                  </div>
                  <div>
                    <label className={LABEL}>망 사업자</label>
                    <select
                      value={form.mvno}
                      onChange={(e) => sf({ mvno: e.target.value as FormData["mvno"] })}
                      className={SELECT}
                    >
                      <option value="SKT">SKT</option>
                      <option value="KT">KT</option>
                      <option value="LGU+">LGU+</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>네트워크</label>
                    <select
                      value={form.network}
                      onChange={(e) => sf({ network: e.target.value as FormData["network"] })}
                      className={SELECT}
                    >
                      <option value="LTE">LTE</option>
                      <option value="5G">5G</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>약정 (개월, 0=무약정)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.contract_months}
                      onChange={(e) => sf({ contract_months: Number(e.target.value) })}
                      className={INPUT}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => sf({ is_active: e.target.checked })}
                        className="w-4 h-4 rounded accent-brand-600"
                      />
                      <span className="text-sm text-gray-700">활성화 (사이트 노출)</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* ── 요금 ── */}
              <section>
                <p className={SECTION_TITLE}>요금</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>월 요금 (원) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.monthly_fee}
                      onChange={(e) => sf({ monthly_fee: Number(e.target.value) })}
                      className={INPUT}
                    />
                    {form.monthly_fee > 0 && (
                      <p className="text-[11px] text-brand-600 mt-1">
                        = {fmtFee(form.monthly_fee)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={LABEL}>정상가 (원, 프로모션 할인 전)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.original_fee ?? ""}
                      onChange={(e) =>
                        sf({ original_fee: e.target.value ? Number(e.target.value) : null })
                      }
                      placeholder="프로모션 없으면 비워두세요"
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>프로모션 적용 개월</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={form.promo_months ?? ""}
                      onChange={(e) =>
                        sf({ promo_months: e.target.value ? Number(e.target.value) : null })
                      }
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>프로모션 표시 텍스트</label>
                    <input
                      value={form.promo_text ?? ""}
                      onChange={(e) => sf({ promo_text: e.target.value || null })}
                      placeholder="예: 6개월 반값"
                      className={INPUT}
                    />
                  </div>
                </div>
              </section>

              {/* ── 데이터 ── */}
              <section>
                <p className={SECTION_TITLE}>데이터</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.data_unlimited}
                      onChange={(e) =>
                        sf({
                          data_unlimited: e.target.checked,
                          ...(e.target.checked && { data_mb: null, throttled_speed: null }),
                        })
                      }
                      className="w-4 h-4 rounded accent-brand-600"
                    />
                    <span className="text-sm text-gray-700">데이터 완전 무제한</span>
                  </label>

                  {!form.data_unlimited && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>데이터 용량 (MB)</label>
                        <input
                          type="number"
                          min="0"
                          value={form.data_mb ?? ""}
                          onChange={(e) =>
                            sf({ data_mb: e.target.value ? Number(e.target.value) : null })
                          }
                          placeholder="예: 11264 (=11GB)"
                          className={INPUT}
                        />
                        {form.data_mb ? (
                          <p className="text-[11px] text-gray-400 mt-1">
                            = {(form.data_mb / 1024).toFixed(2)} GB
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label className={LABEL}>소진 후 속도 (Kbps, 없으면 비워두세요)</label>
                        <input
                          type="number"
                          min="0"
                          value={form.throttled_speed ?? ""}
                          onChange={(e) =>
                            sf({ throttled_speed: e.target.value ? Number(e.target.value) : null })
                          }
                          placeholder="예: 400 · 1000 · 5000"
                          className={INPUT}
                        />
                        {form.throttled_speed ? (
                          <p className="text-[11px] text-gray-400 mt-1">
                            = {fmtSpeed(form.throttled_speed)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── 통화 / 문자 ── */}
              <section>
                <p className={SECTION_TITLE}>통화 / 문자</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* 통화 */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.voice_unlimited}
                        onChange={(e) =>
                          sf({ voice_unlimited: e.target.checked, ...(e.target.checked && { voice_min: null }) })
                        }
                        className="w-4 h-4 rounded accent-brand-600"
                      />
                      <span className="text-sm text-gray-700">통화 무제한</span>
                    </label>
                    {!form.voice_unlimited && (
                      <div>
                        <label className={LABEL}>통화 (분)</label>
                        <input
                          type="number"
                          min="0"
                          value={form.voice_min ?? ""}
                          onChange={(e) =>
                            sf({ voice_min: e.target.value ? Number(e.target.value) : null })
                          }
                          className={INPUT}
                        />
                      </div>
                    )}
                  </div>
                  {/* 문자 */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.sms_unlimited}
                        onChange={(e) =>
                          sf({ sms_unlimited: e.target.checked, ...(e.target.checked && { sms_cnt: null }) })
                        }
                        className="w-4 h-4 rounded accent-brand-600"
                      />
                      <span className="text-sm text-gray-700">문자 무제한</span>
                    </label>
                    {!form.sms_unlimited && (
                      <div>
                        <label className={LABEL}>문자 (건)</label>
                        <input
                          type="number"
                          min="0"
                          value={form.sms_cnt ?? ""}
                          onChange={(e) =>
                            sf({ sms_cnt: e.target.value ? Number(e.target.value) : null })
                          }
                          className={INPUT}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ── 혜택 ── */}
              <section>
                <p className={SECTION_TITLE}>혜택</p>
                <BenefitEditor
                  benefits={form.benefits}
                  onChange={(v) => sf({ benefits: v })}
                />
              </section>

              {/* ── 가입 URL ── */}
              <section>
                <p className={SECTION_TITLE}>가입 링크</p>
                <div className="flex gap-2">
                  <input
                    value={form.url ?? ""}
                    onChange={(e) => sf({ url: e.target.value || null })}
                    placeholder="https://…"
                    className={INPUT}
                  />
                  {form.url && (
                    <a
                      href={form.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200
                                 rounded-xl text-gray-600 font-medium transition-colors"
                    >
                      열기 →
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  utm_source=MVNOGALLERY 파라미터는 사이트 표시 시 자동 삽입됩니다.
                </p>
              </section>

              {/* 버튼 */}
              <div className="flex justify-end gap-3 pt-2 pb-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-medium
                             text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2 bg-brand-800 hover:bg-brand-700 disabled:opacity-50
                             text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {saving ? "저장 중…" : isNew ? "등록" : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
