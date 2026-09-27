"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { INQUIRY_TYPES, InquiryType } from "@/lib/partners";

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 " +
  "px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500";

/** ?carrier=헬로모바일&type=correction 으로 진입 시 폼을 미리 채운다 (요금제 상세·망별 페이지 링크) */
export default function PartnerForm() {
  const sp = useSearchParams();
  const defaultCompany = (sp.get("carrier") ?? "").slice(0, 100);
  const typeParam = sp.get("type") ?? "";
  const defaultType: InquiryType = typeParam in INQUIRY_TYPES ? (typeParam as InquiryType) : "listing";
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch("/api/partners/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "접수에 실패했습니다.");
      setStatus("done");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-green-50 dark:bg-green-950 p-6 text-center">
        <p className="text-base font-bold text-green-800 dark:text-green-200 mb-1">문의가 접수되었습니다</p>
        <p className="text-sm text-green-700 dark:text-green-300">영업일 기준 2일 안에 입력하신 이메일로 연락드리겠습니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">회사(브랜드)명 *</span>
          <input name="company" required maxLength={100} defaultValue={defaultCompany} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">담당자명 *</span>
          <input name="name" required maxLength={50} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">업무용 이메일 *</span>
          <input name="email" type="email" required maxLength={120} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">연락처</span>
          <input name="phone" type="tel" maxLength={30} className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">문의 유형</span>
        <select name="type" defaultValue={defaultType} className={inputCls}>
          {Object.entries(INQUIRY_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">내용</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="등록·수정할 요금제, 원하시는 제휴 형태 등을 적어 주세요."
          className={inputCls}
        />
      </label>
      {/* 봇 차단용 숨김 필드 */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {status === "error" && <p className="text-sm text-rose-600">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
      >
        {status === "sending" ? "보내는 중…" : "문의 보내기"}
      </button>
      <p className="text-[11px] text-gray-400 text-center">
        입력하신 정보는 문의 회신 목적으로만 사용됩니다.
      </p>
    </form>
  );
}
