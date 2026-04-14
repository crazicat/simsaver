"use client";
import { useState, useMemo, useCallback } from "react";
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

export default function HomeClient({ plans }: { plans: Plan[] }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("fee_asc");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(
    () => filterAndSort(plans, filters, sort),
    [plans, filters, sort]
  );

  const comparePlans = plans.filter((p) => compare.includes(p.id));

  // 마지막 수집 시간 (plans 중 가장 최근)
  const lastUpdated = plans.length > 0
    ? plans.map((p) => p.lastUpdated).sort().reverse()[0]
    : null;

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
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-semibold tracking-tight">
              SIMsaver
            </span>
            <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100
                             dark:bg-gray-800 px-2 py-0.5 rounded-full">
              알뜰폰 요금제 비교
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:block text-xs text-gray-400">
                마지막 수집: {lastUpdated}
              </span>
            )}
            {/* 모바일 필터 토글 */}
            <button
              className="sm:hidden btn-ghost text-xs"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? "닫기" : "필터"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-5 flex gap-5">
        {/* ── 사이드바 ── */}
        <div
          className={`
            ${sidebarOpen ? "block" : "hidden"} sm:block
            absolute sm:relative z-20 sm:z-auto
            w-52 top-14 sm:top-auto left-4 sm:left-auto
          `}
        >
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        {/* ── 메인 콘텐츠 ── */}
        <main className="flex-1 min-w-0">
          {/* 결과 수 + 정렬 */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {filtered.length}
              </span>
              개 요금제
            </p>
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

          {/* 카드 그리드 */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">조건에 맞는 요금제가 없습니다</p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-3 text-xs text-brand-600 hover:underline"
              >
                필터 초기화
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── 비교 플로팅 버튼 ── */}
      {compare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-lg shadow-brand-800/30"
          >
            <span>{compare.length}개 요금제 비교하기</span>
            <span className="opacity-70">→</span>
          </button>
          {compare.length > 0 && (
            <button
              onClick={() => setCompare([])}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full
                         bg-gray-500 text-white text-xs flex items-center justify-center"
              aria-label="비교 목록 초기화"
            >
              ✕
            </button>
          )}
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
