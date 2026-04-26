"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Plan, SortKey } from "@/lib/types";
import { filterAndSort, DEFAULT_FILTERS } from "@/lib/plans";
import PlanCard from "@/components/PlanCard";
import FilterPanel from "@/components/FilterPanel";
import CompareModal from "@/components/CompareModal";

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

export default function HomeClient({ plans }: { plans: Plan[] }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("fee_asc");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const filtered = useMemo(
    () => filterAndSort(plans, filters, sort),
    [plans, filters, sort]
  );

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

      {/* ── 모바일: 빠른 데이터 칩 + 필터/정렬 바 ── */}
      <div className="sm:hidden sticky top-[52px] z-20 bg-white dark:bg-gray-900
                       border-b border-gray-100 dark:border-gray-800">
        {/* 데이터 칩 스크롤 */}
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar">
          {DATA_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilters((f) => ({ ...f, minDataGb: chip.value }))}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all
                ${filters.minDataGb === chip.value
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 필터 + 정렬 */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-50 dark:border-gray-800">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400
                       bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            필터
            {activeFilterCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] w-4 h-4 rounded-full
                               flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg
                       px-2 py-1.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300
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

      <div className="max-w-screen-xl mx-auto px-4 py-4 sm:py-5 flex gap-5">
        {/* ── 데스크탑 사이드바 ── */}
        <div className="hidden sm:block">
          <div className="sticky top-[72px]">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* ── 메인 콘텐츠 ── */}
        <main className="flex-1 min-w-0">
          {/* 결과 수 + 정렬 (데스크탑) */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {filtered.length}
              </span>
              <span className="ml-0.5">개 요금제</span>
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="hidden sm:block text-sm border border-gray-200 dark:border-gray-700 rounded-xl
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

          {/* 카드 그리드 */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isFav={favs.has(plan.id)}
                  inCompare={compare.includes(plan.id)}
                  compareDisabled={compare.length >= 3}
                  onFav={() => toggleFav(plan.id)}
                  onCompare={() => toggleCompare(plan.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">조건에 맞는 요금제가 없습니다</p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-3 text-xs text-brand-600 hover:underline font-medium"
              >
                필터 초기화
              </button>
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
