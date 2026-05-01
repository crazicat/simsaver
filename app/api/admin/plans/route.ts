import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env 미설정");
  return createClient(url, key, { auth: { persistSession: false } });
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// ── GET: 요금제 목록 (검색 + 페이지네이션) ─────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, parseInt(sp.get("limit") ?? "50"));
  const search = sp.get("search") ?? "";
  const mvno   = sp.get("mvno")   ?? "";
  const active = sp.get("active") ?? ""; // "true" | "false" | ""
  const from   = (page - 1) * limit;

  try {
    const db = getAdminClient();
    let q = db
      .from("plans")
      .select(
        "id,carrier_name,mvno,network,name,monthly_fee,data_mb,data_unlimited," +
        "throttled_speed,voice_unlimited,voice_min,sms_unlimited,sms_cnt," +
        "benefits,contract_months,url,is_active,original_fee,promo_months," +
        "promo_text,last_crawled_at",
        { count: "exact" }
      );

    if (search) q = q.or(`carrier_name.ilike.%${search}%,name.ilike.%${search}%`);
    if (mvno)   q = q.eq("mvno", mvno);
    if (active === "true")  q = q.eq("is_active", true);
    if (active === "false") q = q.eq("is_active", false);

    const { data, error, count } = await q
      .order("carrier_name", { ascending: true })
      .order("monthly_fee",  { ascending: true })
      .range(from, from + limit - 1);

    if (error) throw error;
    return NextResponse.json({ data, count, page, limit });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// ── PUT: 요금제 수정 (?id=UUID) ───────────────────────────────
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필요" }, { status: 400 });

  try {
    const body = await req.json();
    const db   = getAdminClient();
    const { data, error } = await db
      .from("plans")
      .update({ ...body, last_crawled_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// ── POST: 요금제 수동 등록 ────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const db   = getAdminClient();
    const { data, error } = await db
      .from("plans")
      .insert({ ...body, last_crawled_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
