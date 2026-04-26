"use client";
import { FilterState } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/plans";

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0
        ${checked ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
          transition-transform duration-200 ${checked ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

const MVNOS = ["SKT", "KT", "LGU+"] as const;
const MVNO_BADGE: Record<string, string> = {
  SKT:  "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  KT:   "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "LGU+": "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

function FilterContent({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const set = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  const toggleMvno = (m: "SKT" | "KT" | "LGU+") => {
    const next = filters.mvno.includes(m)
      ? filters.mvno.filter((x) => x !== m)
      : [...filters.mvno, m];
    set({ mvno: next });
  };

  return (
    <>
      {/* 검색 */}
      <input
        type="search"
        placeholder="통신사 / 요금제 검색"
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
        className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                   bg-gray-50 dark:bg-gray-800 placeholder-gray-400 outline-none
                   focus:border-brand-400 transition-colors mb-5"
      />

      {/* 기반망 */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2.5">
          기반망
        </p>
        <div className="flex gap-2">
          {MVNOS.map((m) => {
            const active = filters.mvno.includes(m);
            return (
              <button
                key={m}
                onClick={() => toggleMvno(m)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all
                  ${active
                    ? MVNO_BADGE[m] + " ring-2 ring-brand-400 ring-offset-1"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* 네트워크 */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2.5">
          네트워크
        </p>
        <div className="flex gap-1">
          {(["ALL", "LTE", "5G"] as const).map((n) => (
            <button
              key={n}
              onClick={() => set({ network: n })}
              className={`flex-1 text-xs py-2 rounded-lg border transition-colors font-medium
                ${
                  filters.network === n
                    ? "bg-brand-800 text-white border-brand-800"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* 최대 요금 */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            최대 요금
          </p>
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-100">
            {filters.maxFee.toLocaleString()}원
          </p>
        </div>
        <input
          type="range"
          min={5000}
          max={50000}
          step={1000}
          value={filters.maxFee}
          onChange={(e) => set({ maxFee: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>5,000원</span>
          <span>50,000원</span>
        </div>
      </div>

      {/* 최소 데이터 */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            최소 데이터
          </p>
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-100">
            {filters.minDataGb === 0 ? "제한없음" : `${filters.minDataGb}GB+`}
          </p>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={filters.minDataGb}
          onChange={(e) => set({ minDataGb: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
      </div>

      {/* 토글 */}
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            통화 무제한
          </span>
          <Toggle
            checked={filters.unlimitedVoice}
            onChange={(v) => set({ unlimitedVoice: v })}
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            무약정만
          </span>
          <Toggle
            checked={filters.noContract}
            onChange={(v) => set({ noContract: v })}
          />
        </label>
      </div>
    </>
  );
}

export default function FilterPanel({ filters, onChange, isMobile, onClose }: Props) {
  const isDirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  // 모바일: 풀스크린 바텀시트
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 w-full rounded-t-2xl max-h-[85vh]
                     overflow-y-auto overscroll-contain animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 핸들 바 */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-base font-semibold">필터</span>
            <div className="flex items-center gap-3">
              {isDirty && (
                <button
                  onClick={() => onChange(DEFAULT_FILTERS)}
                  className="text-xs text-brand-600 font-medium"
                >
                  초기화
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none p-1"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 필터 콘텐츠 */}
          <div className="px-5 py-4">
            <FilterContent filters={filters} onChange={onChange} />
          </div>

          {/* 적용 버튼 (safe area) */}
          <div className="sticky bottom-0 px-5 py-4 bg-white dark:bg-gray-900
                          border-t border-gray-100 dark:border-gray-800"
               style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button
              onClick={onClose}
              className="w-full btn-primary justify-center"
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 데스크탑: 사이드바
  return (
    <aside className="w-52 flex-shrink-0 flex flex-col gap-3">
      <div className="filter-panel">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">필터</span>
          {isDirty && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-xs text-brand-600 hover:underline"
            >
              초기화
            </button>
          )}
        </div>
        <FilterContent filters={filters} onChange={onChange} />
      </div>
    </aside>
  );
}
