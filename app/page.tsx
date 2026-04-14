import { fetchPlansFromDb } from "@/lib/plans";
import HomeClient from "@/components/HomeClient";

// 30분마다 재검증 (ISR)
export const revalidate = 1800;

export default async function HomePage() {
  const plans = await fetchPlansFromDb();
  return <HomeClient plans={plans} />;
}
