"use client";
import { Banner } from "@/lib/banners";

interface Props { banner: Banner }

export default function BannerHero({ banner }: Props) {
  const inner = (
    <>
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
           style={{ background: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />

      <div className="relative px-5 py-4 sm:px-7 sm:py-5 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {banner.badgeText && (
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2
                             bg-white/20 backdrop-blur-sm"
                  style={{ color: banner.textColor }}>
              {banner.badgeText}
            </span>
          )}
          <h2 className="text-base sm:text-lg font-bold leading-snug truncate"
              style={{ color: banner.textColor }}>
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="text-[12px] sm:text-sm mt-0.5 opacity-80 line-clamp-1"
               style={{ color: banner.textColor }}>
              {banner.subtitle}
            </p>
          )}
        </div>
        {banner.ctaText && banner.linkUrl && (
          <span className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap
                           bg-white/20 group-hover:bg-white/30 transition-colors"
                style={{ color: banner.textColor }}>
            {banner.ctaText} →
          </span>
        )}
      </div>
    </>
  );

  if (banner.linkUrl) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative rounded-2xl overflow-hidden mb-4 block
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{ background: banner.bgColor, color: banner.textColor }}
        aria-label={banner.title}
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-4"
      style={{ background: banner.bgColor, color: banner.textColor }}
    >
      {inner}
    </div>
  );
}
