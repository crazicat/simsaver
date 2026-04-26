import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "알뜰폰갤러리 — 알뜰폰 요금제 비교",
  description:
    "수십 개 알뜰폰 통신사 요금제를 자동으로 수집해 항상 최신 정보로 비교하세요. 가격·데이터·통화 조건에 맞는 최적 요금제를 찾아드립니다.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "알뜰폰갤러리",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "알뜰폰갤러리 — 알뜰폰 요금제 비교",
    description: "항상 최신 알뜰폰 요금제, 한눈에 비교",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1724",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* iOS PWA */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Preload Pretendard */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
