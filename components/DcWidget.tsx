import { DcPost } from "@/lib/dcinside";

interface Props {
  posts: DcPost[];
}

export default function DcWidget({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-gray-100 dark:border-gray-800
                    bg-white dark:bg-gray-900 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">🔥</span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            힛갤 최신글
          </span>
        </div>
        <a
          href="https://gall.dcinside.com/mgallery/board/lists/?id=mvnogallery&sort_type=N&search_head=190"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-400 hover:text-brand-600 transition-colors"
        >
          더보기 →
        </a>
      </div>

      {/* 글 목록 */}
      <ul className="divide-y divide-gray-50 dark:divide-gray-800">
        {posts.map((p) => (
          <li key={p.no}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5 px-4 py-2.5
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200
                               group-hover:text-brand-700 dark:group-hover:text-brand-300
                               line-clamp-2 leading-snug">
                {p.title}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400">{p.date}</span>
                {p.views && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {p.views}
                  </span>
                )}
                {p.recommend && p.recommend !== "0" && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {p.recommend}
                  </span>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
