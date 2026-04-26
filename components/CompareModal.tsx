"use client";
import { useEffect } from "react";
import { Plan } from "@/lib/types";
import { fmtFee, fmtData, fmtVoice, fmtSms, fmtContract } from "@/lib/plans";

interface Props {
  plans: Plan[];
  onClose: () => void;
}

const ROWS: [string, (p: Plan) => string][] = [
  ["월 요금",   (p) => fmtFee(p.monthlyFee)],
  ["데이터",    (p) => fmtData(p.data)],
  ["소진 후",   (p) => p.data.throttledSpeed ? `${p.data.throttledSpeed}Kbps` : "—"],
  ["통화",      (p) => fmtVoice(p.voice)],
  ["문자",      (p) => fmtSms(p.sms)],
  ["기반망",    (p) => p.mvno],
  ["네트워크",  (p) => p.network],
  ["약정",      (p) => fmtContract(p.contractMonths)],
];

export default function CompareModal({ plans, onClose }: Props) {
  // 배경 스크롤 방지
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // 요금 기준 최저가 강조
  const minFee = Math.min(...plans.map((p) => p.monthlyFee));

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center
                 justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full sm:max-w-3xl
                   rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto
                   border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">요금제 비교</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 비교 그리드 */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${plans.length}, 1fr)` }}
        >
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl p-4 border
                ${p.monthlyFee === minFee
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
                }`}
            >
              {p.monthlyFee === minFee && plans.length > 1 && (
                <span className="text-[10px] font-medium text-brand-600 bg-brand-100
                                 dark:bg-brand-900 px-2 py-0.5 rounded-full mb-2 block w-fit">
                  최저가
                </span>
              )}
              <p className="text-xs text-gray-500 mb-0.5">{p.carrier}</p>
              <p className="text-sm font-medium mb-3 leading-snug">{p.name}</p>
              <p className="text-xl font-semibold text-brand-800 dark:text-brand-100 mb-4">
                {fmtFee(p.monthlyFee)}
                <span className="text-xs font-normal text-gray-400 ml-1">/월</span>
              </p>

              {ROWS.map(([label, fn]) => (
                <div
                  key={label}
                  className="flex justify-between py-1.5 border-b border-gray-100
                             dark:border-gray-700 last:border-0 text-xs"
                >
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium">{fn(p)}</span>
                </div>
              ))}

              {/* 혜택 */}
              <div className="mt-3 flex flex-wrap gap-1">
                {p.benefits.map((b) => (
                  <span
                    key={b}
                    className="text-[10px] bg-blue-50 dark:bg-blue-950
                               text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 원본 링크 */}
        <p className="text-xs text-gray-400 text-center mt-4">
          정확한 정보는 각 통신사 공식 사이트에서 확인하세요
        </p>
      </div>
    </div>
  );
}
