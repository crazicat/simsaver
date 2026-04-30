export interface DcPost {
  no: string;
  title: string;
  url: string;
  date: string;
  views: string;
  recommend: string;
}

// HTML에서 포스트 파싱
function parsePostList(html: string, limit: number): DcPost[] {
  const posts: DcPost[] = [];

  // <tr class="ub-content ..."> 단위로 분리
  const rows = html.split('<tr class="ub-content');
  for (let i = 1; i < rows.length && posts.length < limit; i++) {
    const row = rows[i];

    // 게시글 번호
    const noMatch = row.match(/data-no="(\d+)"/);
    if (!noMatch) continue;
    const no = noMatch[1];

    // 제목 + 링크: class="gall_tit" 안의 <a>
    const titleBlock = row.match(/class="gall_tit[^"]*"([\s\S]*?)<\/td>/);
    if (!titleBlock) continue;
    const hrefMatch = titleBlock[1].match(/href="([^"]+)"/);
    const rawTitle = titleBlock[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!rawTitle || !hrefMatch) continue;

    const href = hrefMatch[1];
    const url = href.startsWith("http")
      ? href
      : `https://gall.dcinside.com${href}`;

    // 날짜 (title 속성 우선 — 전체 날짜 포함)
    const dateFullMatch = row.match(/class="gall_date"[^>]*title="([^"]+)"/);
    const dateShortMatch = row.match(/class="gall_date"[^>]*>([^<]+)</);
    const date = dateFullMatch
      ? dateFullMatch[1].slice(0, 10)   // "2026.05.01 12:34:56" → "2026.05.01"
      : (dateShortMatch ? dateShortMatch[1].trim() : "");

    // 조회수
    const viewsMatch = row.match(/class="gall_count">([^<]+)</);
    const views = viewsMatch ? viewsMatch[1].trim() : "";

    // 추천
    const recMatch = row.match(/class="gall_recommend">([^<]+)</);
    const recommend = recMatch ? recMatch[1].trim() : "0";

    posts.push({ no, title: rawTitle, url, date, views, recommend });
  }

  return posts;
}

// 힛갤 최신글 5개 가져오기 (5분 캐시)
export async function fetchDcPosts(limit = 5): Promise<DcPost[]> {
  try {
    const res = await fetch(
      "https://gall.dcinside.com/mgallery/board/lists/?id=mvnogallery&sort_type=N&search_head=190&page=1",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer:
            "https://gall.dcinside.com/mgallery/board/lists/?id=mvnogallery",
          "Accept-Language": "ko-KR,ko;q=0.9",
          Accept:
            "text/html,application/xhtml+xml,application/xhtml+xml;q=0.9,*/*;q=0.8",
        },
        next: { revalidate: 300 }, // 5분
      }
    );
    if (!res.ok) return [];
    const html = await res.text();
    return parsePostList(html, limit);
  } catch {
    return [];
  }
}
