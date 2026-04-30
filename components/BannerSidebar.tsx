"use client";
import { Banner } from "@/lib/banners";

interface Props { banner: Banner }

export default function BannerSidebar({ banner }: Props) {
  const handleClick = () => {
    if (banner.linkUrl) window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden mt-4 p-4
                  ${banner.linkUrl ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      style={{ background: banner.bgColor, color: banner.textColor }}
      onClick={banner.linkUrl ? handleClick : undefined}
    >
      <div className="absolute inset-0 pointer-events-none opacity-10"
           style={{ background: "radial-gradient(circle at 90% 10%, white 0%, transparent 50%)" }} />

      <div className="relative">
        {banner.badgeText && (
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2
                           bg-white/20"
                style={{ color: banner.textColor }}>
            {banner.badgeText}
          </span>
        )}
        <p className="text-xs font-bold leading-snug mb-1" style={{ color: banner.textColor }}>
          {banner.title}
        </p>
        {banner.subtitle && (
          <p className="text-[11px] opacity-75 line-clamp-2" style={{ color: banner.textColor }}>
            {banner.subtitle}
          </p>
        )}
        {banner.ctaText && (
          <span className="inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-lg
                           bg-white/20"
                style={{ color: banner.textColor }}>
            {banner.ctaText} →
          </span>
        )}
      </div>
    </div>
  );
}
