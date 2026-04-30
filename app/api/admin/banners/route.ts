import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── 관리자용 Supabase 클라이언트 (RLS 우회) ──────────────────
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env 미설정");
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── 인증 체크 ────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false; // ADMIN_SECRET 미설정 시 전면 차단
  const authHeader = req.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${secret}`;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// ── GET: 전체 배너 목록 (관리자용 — 비활성 포함) ──────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const db = getAdminClient();
    const { data, error } = await db
      .from("banners")
      .select("*")
      .order("position")
      .order("display_order");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// ── POST: 배너 생성 ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    const db = getAdminClient();
    const { data, error } = await db
      .from("banners")
      .insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// ── PUT: 배너 수정 (?id=UUID) ──────────────────────────────────
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
  try {
    const body = await req.json();
    const db = getAdminClient();
    const { data, error } = await db
      .from("banners")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// ── DELETE: 배너 삭제 (?id=UUID) ──────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });
  try {
    const db = getAdminClient();
    const { error } = await db.from("banners").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
