"use client";
import { useState, useEffect, useCallback } from "react";

// ── 타입 ─────────────────────────────────────────────────────────
interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string | null;
  bg_color: string;
  text_color: string;
  cta_text: string | null;
  link_url: string | null;
  position: "hero" | "mid_grid" | "sidebar";
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const EMPTY_FORM: Omit<BannerRow, "id" | "created_at"> = {
  title: "",
  subtitle: null,
  badge_text: null,
  bg_color: "#1e3a5f",
  text_color: "#ffffff",
  cta_text: "자세히 보기",
  link_url: null,
  position: "hero",
  display_order: 0,
  is_active: true,
  start_date: null,
  end_date: null,
};

// ── 컴포넌트 ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [banners, setBanners]   = useState<BannerRow[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const [form, setForm]         = useState<Omit<BannerRow, "id" | "created_at">>(EMPTY_FORM);
  const [editId, setEditId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── API 헬퍼 ────────────────────────────────────────────────
  const apiFetch = useCallback(
    (path: string, opts?: RequestInit) =>
      fetch(path, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          ...(opts?.headers ?? {}),
        },
      }),
    []
  );

  // ── 배너 목록 로드 ──────────────────────────────────────────
  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/admin/banners");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: BannerRow[] = await res.json();
      setBanners(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // ── 폼 핸들러 ───────────────────────────────────────────────
  function handleEdit(b: BannerRow) {
    setEditId(b.id);
    setForm({
      title:         b.title,
      subtitle:      b.subtitle,
      badge_text:    b.badge_text,
      bg_color:      b.bg_color,
      text_color:    b.text_color,
      cta_text:      b.cta_text,
      link_url:      b.link_url,
      position:      b.position,
      display_order: b.display_order,
      is_active:     b.is_active,
      start_date:    b.start_date,
      end_date:      b.end_date,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = JSON.stringify(form);
      const res = editId
        ? await apiFetch(`/api/admin/banners?id=${editId}`, { method: "PUT",  body })
        : await apiFetch("/api/admin/banners",              { method: "POST", body });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setEditId(null);
      setForm(EMPTY_FORM);
      await loadBanners();
      // 저장 즉시 사이트 캐시 갱신
      await fetch("/api/admin/revalidate", { method: "POST" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/admin/banners?id=${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDeleteId(null);
      await loadBanners();
      await fetch("/api/admin/revalidate", { method: "POST" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(b: BannerRow) {
    try {
      const res = await apiFetch(`/api/admin/banners?id=${b.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !b.is_active }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadBanners();
      await fetch("/api/admin/revalidate", { method: "POST" });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // ── 관리자 UI ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-brand-800">알뜰폰갤러리</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              관리자
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const res = await fetch("/api/admin/revalidate", { method: "POST" });
                if (res.ok) alert("✅ 사이트에 반영되었습니다!");
                else alert("반영 실패");
              }}
              className="text-xs bg-brand-800 hover:bg-brand-700 text-white px-3 py-1.5
                         rounded-lg font-medium transition-colors"
            >
              사이트 반영
            </button>
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← 메인으로</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
            <button onClick={() => setError("")} className="ml-2 font-bold">✕</button>
          </div>
        )}

        {/* ── 배너 편집 폼 ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">
              {editId ? "배너 수정" : "새 배너 만들기"}
            </h2>
            {editId && (
              <button onClick={handleNew}
                      className="text-xs text-gray-400 hover:text-gray-600">
                ✕ 취소
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">제목 *</label>
                <input value={form.title}
                       onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500"
                       required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">부제목</label>
                <input value={form.subtitle ?? ""}
                       onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value || null }))}
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">배지 텍스트</label>
                <input value={form.badge_text ?? ""}
                       onChange={(e) => setForm(f => ({ ...f, badge_text: e.target.value || null }))}
                       placeholder="예: 🔥 한정 프로모션"
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">CTA 버튼 텍스트</label>
                <input value={form.cta_text ?? ""}
                       onChange={(e) => setForm(f => ({ ...f, cta_text: e.target.value || null }))}
                       placeholder="자세히 보기"
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1 font-medium">링크 URL</label>
                <input value={form.link_url ?? ""}
                       onChange={(e) => setForm(f => ({ ...f, link_url: e.target.value || null }))}
                       placeholder="https://..."
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            {/* 디자인 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">배경색</label>
                <div className="flex items-center gap-2">
                  <input type="color"
                         value={form.bg_color}
                         onChange={(e) => setForm(f => ({ ...f, bg_color: e.target.value }))}
                         className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input value={form.bg_color}
                         onChange={(e) => setForm(f => ({ ...f, bg_color: e.target.value }))}
                         className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none
                                    focus:ring-2 focus:ring-brand-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">텍스트색</label>
                <div className="flex items-center gap-2">
                  <input type="color"
                         value={form.text_color}
                         onChange={(e) => setForm(f => ({ ...f, text_color: e.target.value }))}
                         className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                  <input value={form.text_color}
                         onChange={(e) => setForm(f => ({ ...f, text_color: e.target.value }))}
                         className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none
                                    focus:ring-2 focus:ring-brand-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">위치</label>
                <select value={form.position}
                        onChange={(e) => setForm(f => ({ ...f, position: e.target.value as BannerRow["position"] }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none
                                   focus:ring-2 focus:ring-brand-500 bg-white">
                  <option value="hero">히어로</option>
                  <option value="mid_grid">인라인 (그리드)</option>
                  <option value="sidebar">사이드바</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">노출 순서</label>
                <input type="number" value={form.display_order}
                       onChange={(e) => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            {/* 기간 + 활성 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">시작일 (선택)</label>
                <input type="date"
                       value={form.start_date?.slice(0, 10) ?? ""}
                       onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value || null }))}
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">종료일 (선택)</label>
                <input type="date"
                       value={form.end_date?.slice(0, 10) ?? ""}
                       onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value || null }))}
                       className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                                  focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <input type="checkbox" id="is_active"
                       checked={form.is_active}
                       onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                       className="w-4 h-4 rounded accent-brand-600 cursor-pointer" />
                <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                  활성화
                </label>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving}
                        className="px-5 py-2 bg-brand-800 hover:bg-brand-700 disabled:opacity-50
                                   text-white text-sm font-semibold rounded-xl transition-colors">
                  {saving ? "저장 중…" : editId ? "수정 저장" : "배너 만들기"}
                </button>
              </div>
            </div>

            {/* 미리보기 */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-2 font-medium">미리보기</p>
              <div className="relative rounded-2xl overflow-hidden inline-block min-w-[240px] max-w-xs p-4"
                   style={{ background: form.bg_color, color: form.text_color }}>
                <div className="absolute inset-0 pointer-events-none opacity-10"
                     style={{ background: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
                <div className="relative">
                  {form.badge_text && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 bg-white/20"
                          style={{ color: form.text_color }}>
                      {form.badge_text}
                    </span>
                  )}
                  <p className="text-sm font-bold leading-snug mb-1" style={{ color: form.text_color }}>
                    {form.title || "제목을 입력하세요"}
                  </p>
                  {form.subtitle && (
                    <p className="text-[11px] opacity-80" style={{ color: form.text_color }}>
                      {form.subtitle}
                    </p>
                  )}
                  {form.cta_text && (
                    <span className="inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/20"
                          style={{ color: form.text_color }}>
                      {form.cta_text} →
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* ── 배너 목록 ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">배너 목록</h2>
            <button onClick={loadBanners}
                    disabled={loading}
                    className="text-xs text-brand-600 hover:underline disabled:opacity-40">
              {loading ? "불러오는 중…" : "새로고침"}
            </button>
          </div>

          {banners.length === 0 && !loading && (
            <p className="text-sm text-gray-400 text-center py-8">등록된 배너가 없습니다.</p>
          )}

          <div className="space-y-3">
            {banners.map((b) => (
              <div key={b.id}
                   className={`flex items-start gap-4 p-4 rounded-xl border transition-colors
                     ${b.is_active
                       ? "border-gray-200 bg-gray-50"
                       : "border-dashed border-gray-200 bg-gray-50/50 opacity-60"
                     }`}>
                {/* 컬러 미리보기 */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl"
                     style={{ background: b.bg_color }} />

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-sm text-gray-800 truncate">
                      {b.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${b.position === "hero"     ? "bg-blue-100 text-blue-700"
                      : b.position === "mid_grid" ? "bg-green-100 text-green-700"
                      :                              "bg-purple-100 text-purple-700"
                      }`}>
                      {b.position === "hero"     ? "히어로"
                       : b.position === "mid_grid" ? "인라인"
                       : "사이드바"}
                    </span>
                    <span className="text-[10px] text-gray-400">순서 {b.display_order}</span>
                  </div>
                  {b.subtitle && (
                    <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>
                  )}
                  {b.link_url && (
                    <p className="text-[11px] text-brand-600 truncate mt-0.5">{b.link_url}</p>
                  )}
                  {(b.start_date || b.end_date) && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {b.start_date?.slice(0, 10) ?? "–"} ~ {b.end_date?.slice(0, 10) ?? "–"}
                    </p>
                  )}
                </div>

                {/* 액션 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(b)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors
                      ${b.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                  >
                    {b.is_active ? "활성" : "비활성"}
                  </button>
                  <button
                    onClick={() => handleEdit(b)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700
                               hover:bg-blue-200 font-medium transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-red-50 text-red-600
                               hover:bg-red-100 font-medium transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── 삭제 확인 다이얼로그 ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-2">배너 삭제</h3>
            <p className="text-sm text-gray-600 mb-5">
              이 배너를 영구 삭제합니다. 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium
                                 text-gray-600 hover:bg-gray-50 transition-colors">
                취소
              </button>
              <button onClick={handleDelete} disabled={deleting}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50
                                 text-white rounded-xl text-sm font-semibold transition-colors">
                {deleting ? "삭제 중…" : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
