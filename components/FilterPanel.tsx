"use client";
import { FilterState } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/plans";

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
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

export default function FilterPanel({ filters, onChange }: Props) {
  const set = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  const toggleMvno = (m: "SKT" | "KT" | "LGU+") => {
    const next = filters.mvno.includes(m)
      ? filters.mvno.filter((x) => x !== m)
      : [...filters.mvno, m];
    set({ mvno: next });
  };

  const isDirty =
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

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

        {/* 검색 */}
        <input
          type="search"
          placeholder="통신사 / 요금제 검색"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                     bg-gray-50 dark:bg-gray-800 placeholder-gray-400 outline-none
                     focus:border-brand-400 transition-colors mb-4"
        />

        {/* 기반망 */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            기반망
          </p>
          {MVNOS.map((m) => (
            <label
              key={m}
              className="flex items-center gap-2 mb-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={filters.mvno.includes(m)}
                onChange={() => toggleMvno(m)}
                className="accent-brand-600 w-3.5 h-3.5"
              />
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${MVNO_BADGE[m]}`}
              >
                {m}
              </span>
            </label>
          ))}
        </div>

        {/* 네트워크 */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            네트워크
          </p>
          <div className="flex gap-1">
            {(["ALL", "LTE", "5G"] as const).map((n) => (
              <button
                key={n}
                onClick={() => set({ network: n })}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors
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
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            최대 요금
          </p>
          <p className="text-sm font-medium text-brand-800 dark:text-brand-100 mb-2">
            {filters.maxFee.toLocaleString()}원
          </p>
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
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            최소 데이터
          </p>
          <p className="text-sm font-medium text-brand-800 dark:text-brand-100 mb-2">
            {filters.minDataGb === 0 ? "제한없음" : `${filters.minDataGb}GB+`}
          </p>
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
      </div>

    </aside>
  );
}
