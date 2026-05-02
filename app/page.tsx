import type { Metadata } from "next";
import { fetchPlansFromDb } from "@/lib/plans";
import { fetchActiveBanners } from "@/lib/banners";
import { fetchDcPosts } from "@/lib/dcinside";
import HomeClient from "@/components/HomeClient";
import { buildListingMetadata } from "@/lib/seo/metadata";
import { buildItemListJsonLd } from "@/lib/seo/jsonld";

// 30분마다 재검증 (ISR)
export const revalidate = 1800;

export const metadata: Metadata = buildListingMetadata();

export default async function HomePage() {
  const [plans, banners, dcPosts] = await Promise.all([
    fetchPlansFromDb(),
    fetchActiveBanners(),
    fetchDcPosts(5),
  ]);

  const itemListJsonLd = buildItemListJsonLd(plans);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HomeClient plans={plans} banners={banners} dcPosts={dcPosts} />
    </>
  );
}
