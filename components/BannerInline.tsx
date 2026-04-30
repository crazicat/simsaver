"use client";
import { Banner } from "@/lib/banners";

interface Props { banner: Banner }

export default function BannerInline({ banner }: Props) {
  const handleClick = () => {
    if (banner.linkUrl) window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className={`relative rounded-2xl overflow-hidden flex flex-col justify-between
                  min-h-[180px] p-4 sm:p-5 ${banner.linkUrl ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      style={{ background: banner.bgColor, color: banner.textColor }}
      onClick={banner.linkUrl ? handleClick : undefined}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
           style={{ background: "radial-gradient(circle at 20% 80%, white 0%, transparent 55%)" }} />

      <div className="relative">
        {banner.badgeText && (
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2
                           bg-white/20"
                style={{ color: banner.textColor }}>
            {banner.badgeText}
          </span>
        )}
        <h3 className="text-sm font-bold leading-snug mb-1" style={{ color: banner.textColor }}>
          {banner.title}
        </h3>
        {banner.subtitle && (
          <p className="text-[11px] opacity-80 line-clamp-2" style={{ color: banner.textColor }}>
            {banner.subtitle}
          </p>
        )}
      </div>

      {banner.ctaText && (
        <span className="relative self-start mt-3 text-[11px] font-semibold px-3 py-1 rounded-lg
                         bg-white/20 hover:bg-white/30 transition-colors"
              style={{ color: banner.textColor }}>
          {banner.ctaText} →
        </span>
      )}
    </article>
  );
}
