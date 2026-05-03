"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Plan, SortKey } from "@/lib/types";
import { Banner } from "@/lib/banners";
import { filterAndSort, DEFAULT_FILTERS, calcAnnualFee, getPlanBadge } from "@/lib/plans";
import PlanCard from "@/components/PlanCard";
import FilterPanel from "@/components/FilterPanel";
import CompareModal from "@/components/CompareModal";
import BannerHero from "@/components/BannerHero";
import BannerInline from "@/components/BannerInline";
import BannerSidebar from "@/components/BannerSidebar";
import DcWidget from "@/components/DcWidget";
import { DcPost } from "@/lib/dcinside";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "fee_asc",   label: "요금 낮은순" },
  { value: "fee_desc",  label: "요금 높은순" },
  { value: "data_desc", label: "데이터 많은순" },
  { value: "updated",   label: "최신 업데이트순" },
];

const DATA_CHIPS = [
  { label: "전체", value: 0 },
  { label: "1GB+", value: 1 },
  { label: "3GB+", value: 3 },
  { label: "5GB+", value: 5 },
  { label: "10GB+", value: 10 },
  { label: "20GB+", value: 20 },
  { label: "50GB+", value: 50 },
];

// ── 망 탭 ──────────────────────────────────────────────────────
const MVNO_TABS = [
  { label: "전체",  value: null,      activeClass: "bg-brand-800 text-white border-brand-800" },
  { label: "SKT",   value: "SKT"  as const, activeClass: "bg-red-600   text-white border-red-600" },
  { label: "KT",    value: "KT"   as const, activeClass: "bg-amber-500 text-white border-amber-500" },
  { label: "LGU+",  value: "LGU+" as const, activeClass: "bg-purple-600 text-white border-purple-600" },
] as const;

// ── 데이터 사용량 가이드 ──────────────────────────────────────
const DATA_GUIDE = [
  { emoji: "💬", label: "가끔 써요",   desc: "카톡·문자 위주",  minDataGb:  0, maxFee: 12000, unlimited: false },
  { emoji: "📱", label: "조금 써요",   desc: "SNS·검색·지도",   minDataGb:  3, maxFee: 22000, unlimited: false },
  { emoji: "🎬", label: "많이 써요",   desc: "유튜브·동영상",   minDataGb: 10, maxFee: 35000, unlimited: false },
  { emoji: "🎮", label: "헤비 유저",   desc: "게임·라이브",     minDataGb: 20, maxFee: 50000, unlimited: false },
  { emoji: "♾️", label: "무제한",      desc: "제한 없이 자유롭게", minDataGb: 0, maxFee: 50000, unlimited: true  },
] as const;

type FilterPatch = Partial<import("@/lib/types").FilterState>;
const THEME_CHIPS: Array<{
  id: string;
  emoji: string;
  label: string;
  patch: (active: boolean) => FilterPatch;
  isActive: (f: import("@/lib/types").FilterState) => boolean;
}> = [
  {
    id: "under10k",
    emoji: "💰", label: "만원 이하",
    patch: (on) => ({ maxFee: on ? 50000 : 10000 }),
    isActive: (f) => f.maxFee <= 10000,
  },
  {
    id: "unlimited_data",
    emoji: "♾️", label: "데이터 무제한",
    patch: (on) => ({ dataUnlimited: !on }),
    isActive: (f) => f.dataUnlimited,
  },
  {
    id: "5g",
    emoji: "📶", label: "5G",
    patch: (on) => ({ network: on ? "ALL" : "5G" }),
    isActive: (f) => f.network === "5G",
  },
  {
    id: "nocontract",
    emoji: "🔓", label: "무약정",
    patch: (on) => ({ noContract: !on }),
    isActive: (f) => f.noContract,
  },
  {
    id: "unlimited_voice",
    emoji: "📞", label: "통화 무제한",
    patch: (on) => ({ unlimitedVoice: !on }),
    isActive: (f) => f.unlimitedVoice,
  },
];

export default function HomeClient({
  plans,
  banners = [],
  dcPosts = [],
}: {
  plans: Plan[];
  banners?: Banner[];
  dcPosts?: DcPost[];
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("fee_asc");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  // localStorage 즐겨찾기 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem("simsaver_favs");
      if (stored) setFavs(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, []);
  const [compare, setCompare] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showAnnual, setShowAnnual] = useState(false);
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const filtered = useMemo(() => {
    const result = filterAndSort(plans, filters, sort);
    if (showFavsOnly) return result.filter(p => favs.has(p.id));
    return result;
  }, [plans, filters, sort, showFavsOnly, favs]);

  // ── 배너 슬롯 ───────────────────────────────────────────────
  const heroBanner    = banners.find((b) => b.position === "hero");
  const midBanners    = banners.filter((b) => b.position === "mid_grid");
  const sidebarBanner = banners.find((b) => b.position === "sidebar");

  const comparePlans = plans.filter((p) => compare.includes(p.id));

  const lastUpdated = plans.length > 0
    ? plans.map((p) => p.lastUpdated).sort().reverse()[0]
    : null;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.mvno.length > 0) count++;
    if (filters.maxFee < 50000) count++;
    if (filters.minDataGb > 0) count++;
    if (filters.unlimitedVoice) count++;
    if (filters.noContract) count++;
    if (filters.network !== "ALL") count++;
    if (filters.search) count++;
    if (filters.dataUnlimited) count++;
    return count;
  }, [filters]);

  // 모바일 필터 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (showMobileFilter) {
      document.body.classList.add("modal-open");
      return () => document.body.classList.remove("modal-open");
    }
  }, [showMobileFilter]);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("simsaver_favs", JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompare((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  }, []);

  // 현재 활성 망 탭 (단일 선택이면 해당 값, 아니면 null = 전체)
  const activeMvnoTab = filters.mvno.length === 1 ? filters.mvno[0] : null;
  const setMvnoTab = useCallback((v: "SKT" | "KT" | "LGU+" | null) => {
    setFilters(f => ({
      ...f,
      mvno: v && activeMvnoTab !== v ? [v] : [],
    }));
  }, [activeMvnoTab]);

  // 데이터 사용량 가이드: 데이터/가격 필터가 기본값일 때만 표시
  const showDataGuide =
    filters.minDataGb === 0 && !filters.dataUnlimited && filters.maxFee >= 50000;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── 헤더 ── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100
                         dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 h-13 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-brand-800 dark:text-brand-100">
              알뜰폰갤러리
            </span>
            <span className="hidden sm:inline text-[11px] text-gray-400 bg-gray-100
                             dark:bg-gray-800 px-2 py-0.5 rounded-full">
              알뜰폰 요금제 비교
            </span>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="hidden sm:block text-[11px] text-gray-400">
                마지막 수집: {lastUpdated}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── 모바일: 데이터칩 + 필터/정렬 (2줄 → 1줄 통합) ── */}
      <div className="sm:hidden sticky top-[52px] z-20 bg-white dark:bg-gray-900
                       border-b border-gray-100 dark:border-gray-800">
        {/* 단일 행: [데이터칩 스크롤] [필터뱃지] [정렬] */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* 데이터 칩 — flex-shrink 영역 */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
            {DATA_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setFilters((f) => ({ ...f, minDataGb: chip.value }))}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all
                  ${filters.minDataGb === chip.value
                    ? "bg-brand-800 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* 구분선 */}
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

          {/* 즐겨찾기만 보기 */}
          <button
            onClick={() => setShowFavsOnly(v => !v)}
            aria-label="즐겨찾기만 보기"
            className={`flex-shrink-0 text-base leading-none transition-all active:scale-95
              ${showFavsOnly ? "text-red-500" : favs.size > 0 ? "text-gray-400" : "text-gray-200 dark:text-gray-700"}`}
          >
            {showFavsOnly ? "♥" : "♡"}
          </button>

          {/* 12개월 납부총액 */}
          <button
            onClick={() => setShowAnnual(v => !v)}
            aria-label="12개월 납부총액 표시"
            className={`flex-shrink-0 text-xs px-2 py-1.5 rounded-lg font-medium transition-all
              ${showAnnual
                ? "bg-brand-800 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
          >
            📅
          </button>

          {/* 필터 초기화 (활성 시만 노출) */}
          {(activeFilterCount > 0 || showFavsOnly) && (
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); setShowFavsOnly(false); }}
              className="flex-shrink-0 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400
                         bg-rose-50 dark:bg-rose-950/50 px-2 py-1.5 rounded-lg font-medium"
              aria-label="필터 초기화"
            >
              ✕
            </button>
          )}

          {/* 필터 버튼 */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400
                       bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {activeFilterCount > 0 ? (
              <span className="bg-brand-600 text-white text-[10px] w-4 h-4 rounded-full
                               flex items-center justify-center font-bold leading-none">
                {activeFilterCount}
              </span>
            ) : "필터"}
          </button>

          {/* 정렬 */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="flex-shrink-0 text-xs border border-gray-200 dark:border-gray-700 rounded-lg
                       px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300
                       outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-4 sm:py-5 flex gap-5">
        {/* ── 데스크탑 사이드바 ── */}
        <div className="hidden sm:block">
          <div className="sticky top-[72px]">
            <FilterPanel filters={filters} onChange={setFilters} />
            {sidebarBanner && <BannerSidebar banner={sidebarBanner} />}
            <DcWidget posts={dcPosts} />
          </div>
        </div>

        {/* ── 메인 콘텐츠 ── */}
        <main className="flex-1 min-w-0">
          {/* ── 히어로 배너 ── */}
          {heroBanner && <BannerHero banner={heroBanner} />}

          {/* ── 가치 제안 헤드라인 ── */}
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight mb-1">
              알뜰폰 요금제, 한눈에 비교
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
              <span>SKT · KT · LGU+ 망</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="font-semibold text-brand-700 dark:text-brand-300">
                {plans.length}개 요금제
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                매일 자동 업데이트
              </span>
            </p>
          </div>

          {/* ── 망 탭 (모바일·데스크탑 공통) ── */}
          <div className="flex gap-1.5 mb-4">
            {MVNO_TABS.map((tab) => {
              const isActive = tab.value === null
                ? activeMvnoTab === null
                : activeMvnoTab === tab.value;
              return (
                <button
                  key={tab.label}
                  onClick={() => setMvnoTab(tab.value ?? null)}
                  className={`flex-1 sm:flex-none text-xs font-semibold px-4 py-2 rounded-xl border transition-all
                    ${isActive
                      ? tab.activeClass
                      : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── 데이터 사용량 가이드 ── */}
          {showDataGuide && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                데이터 얼마나 쓰세요?
              </p>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {DATA_GUIDE.map((g) => (
                  <button
                    key={g.label}
                    onClick={() =>
                      setFilters(f => ({
                        ...f,
                        minDataGb: g.minDataGb,
                        maxFee: g.maxFee,
                        dataUnlimited: g.unlimited,
                      }))
                    }
                    className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border border-gray-200
                               dark:border-gray-700 bg-white dark:bg-gray-900
                               hover:border-brand-400 hover:shadow-sm transition-all group text-center"
                  >
                    <span className="text-xl sm:text-2xl leading-none">{g.emoji}</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-700">
                      {g.label}
                    </span>
                    <span className="hidden sm:block text-[10px] text-gray-400 leading-tight">
                      {g.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 테마 퀵필터 칩 (데스크탑) */}
          <div className="hidden sm:flex gap-2 mb-4 flex-wrap items-center">
            {THEME_CHIPS.map((chip) => {
              const active = chip.isActive(filters);
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilters((f) => ({ ...f, ...chip.patch(active) }))}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all border
                    ${active
                      ? "bg-brand-800 text-white border-brand-800 shadow-sm"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:text-brand-700"
                    }`}
                >
                  <span className="leading-none">{chip.emoji}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
            {/* 즐겨찾기 필터 */}
            <button
              onClick={() => setShowFavsOnly(v => !v)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all border
                ${showFavsOnly
                  ? "bg-red-500 text-white border-red-500 shadow-sm"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-500"
                }`}
            >
              <span className="leading-none">{showFavsOnly ? "♥" : "♡"}</span>
              <span>즐겨찾기{favs.size > 0 ? ` ${favs.size}` : ""}</span>
            </button>
          </div>

          {/* 결과 수 + 정렬 (데스크탑) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {filtered.length}
                </span>
                <span className="ml-0.5">개 요금제</span>
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="hidden sm:flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400
                             hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors"
                >
                  <span className="text-[10px]">✕</span>
                  <span>필터 {activeFilterCount}개 초기화</span>
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setShowAnnual(v => !v)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium transition-all
                  ${showAnnual
                    ? "bg-brand-800 text-white border-brand-800 shadow-sm"
                    : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-400"
                  }`}
              >
                <span className="leading-none">📅</span>
                <span>12개월 납부총액</span>
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl
                           px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300
                           outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 카드 그리드 */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((plan, idx) => (
                <React.Fragment key={plan.id}>
                  {/* mid_grid 배너: 5번째 카드 앞에 삽입 */}
                  {idx === 5 && midBanners.map((b) => (
                    <BannerInline key={`mid-${b.id}`} banner={b} />
                  ))}
                  <PlanCard
                    plan={plan}
                    isFav={favs.has(plan.id)}
                    inCompare={compare.includes(plan.id)}
                    compareDisabled={compare.length >= 3}
                    onFav={() => toggleFav(plan.id)}
                    onCompare={() => toggleCompare(plan.id)}
                    showAnnual={showAnnual}
                    annualFee={calcAnnualFee(plan)}
                    badge={getPlanBadge(plan, plans)}
                  />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              {showFavsOnly ? (
                <>
                  <p className="text-4xl mb-3">♡</p>
                  <p className="text-sm">즐겨찾기한 요금제가 없습니다</p>
                  <button
                    onClick={() => setShowFavsOnly(false)}
                    className="mt-3 text-xs text-brand-600 hover:underline font-medium"
                  >
                    전체 요금제 보기
                  </button>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-sm">조건에 맞는 요금제가 없습니다</p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="mt-3 text-xs text-brand-600 hover:underline font-medium"
                  >
                    필터 초기화
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── 모바일 바텀시트 필터 ── */}
      {showMobileFilter && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          isMobile
          onClose={() => setShowMobileFilter(false)}
        />
      )}

      {/* ── 비교 플로팅 버튼 ── */}
      {compare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
             style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-lg shadow-brand-800/30"
          >
            <span>{compare.length}개 요금제 비교하기</span>
            <span className="opacity-70">→</span>
          </button>
          <button
            onClick={() => setCompare([])}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full
                       bg-gray-500 text-white text-xs flex items-center justify-center"
            aria-label="비교 목록 초기화"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 비교 모달 ── */}
      {showModal && (
        <CompareModal
          plans={comparePlans}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
