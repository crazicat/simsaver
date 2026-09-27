import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트 (service role — RLS 우회).
 * outbound_clicks / partner_inquiries 는 RLS 정책 없이 잠겨 있어 이 클라이언트로만 읽고 쓴다.
 * 환경변수 미설정 시 null — 호출부는 기능을 조용히 건너뛴다.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}
