export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-10">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* 소개 */}
          <div className="max-w-sm">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              알뜰폰갤러리
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              국내 알뜰폰(MVNO) 요금제를 자동으로 수집·비교하는 서비스입니다.
              요금·스펙 정보는 각 통신사 공식 사이트 기준이며 실시간 변동될 수 있습니다.
              가입 전 반드시 해당 통신사에서 최신 요금을 확인하세요.
            </p>
          </div>

          {/* 링크 */}
          <div className="flex gap-8 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-0.5">서비스</p>
              <a
                href="/"
                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                요금제 비교
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                사이트맵
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                RSS 피드
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-0.5">망 종류</p>
              <span className="text-red-400">SKT망</span>
              <span className="text-amber-400">KT망</span>
              <span className="text-purple-400">LGU+망</span>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} 알뜰폰갤러리. 본 사이트의 요금 정보는 참고용이며 실제 요금은 통신사에서 확인하세요.
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            데이터 출처: 각 MVNO 공식 홈페이지 자동 수집
          </p>
        </div>
      </div>
    </footer>
  );
}
