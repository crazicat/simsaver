import { fetchPlansFromDb } from "@/lib/plans";
import { fetchActiveBanners } from "@/lib/banners";
import { fetchDcPosts } from "@/lib/dcinside";
import HomeClient from "@/components/HomeClient";

// 30분마다 재검증 (ISR) — DC 글은 내부에서 5분 캐시 별도 적용
export const revalidate = 1800;

export default async function HomePage() {
  const [plans, banners, dcPosts] = await Promise.all([
    fetchPlansFromDb(),
    fetchActiveBanners(),
    fetchDcPosts(5),
  ]);
  return <HomeClient plans={plans} banners={banners} dcPosts={dcPosts} />;
}
