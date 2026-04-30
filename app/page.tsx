import { fetchPlansFromDb } from "@/lib/plans";
import { fetchActiveBanners } from "@/lib/banners";
import HomeClient from "@/components/HomeClient";

// 30분마다 재검증 (ISR)
export const revalidate = 1800;

export default async function HomePage() {
  const [plans, banners] = await Promise.all([
    fetchPlansFromDb(),
    fetchActiveBanners(),
  ]);
  return <HomeClient plans={plans} banners={banners} />;
}
