# SIMsaver — 알뜰폰 요금제 비교 앱

알뜰폰 요금제를 자동 수집해 항상 최신 정보로 비교하는 PWA 앱입니다.

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
# → http://localhost:3000

# 3. 프로덕션 빌드 (PWA 활성화)
npm run build && npm start
```

## 배포 (Vercel — 무료)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

또는 GitHub에 push하면 Vercel 대시보드에서 자동 배포됩니다.

## PWA 설치 확인

1. `npm run build && npm start` 로 프로덕션 모드 실행
2. Chrome → 주소창 오른쪽 ⊕ 아이콘 클릭 → "앱 설치"
3. Android: Chrome → 메뉴 → "홈 화면에 추가"
4. iOS Safari: 공유 → "홈 화면에 추가"

## 프로젝트 구조

```
simsaver/
├── app/
│   ├── layout.tsx      # PWA 메타태그, 폰트
│   ├── page.tsx        # 메인 요금제 목록
│   └── globals.css     # Tailwind + 커스텀 스타일
├── components/
│   ├── PlanCard.tsx    # 요금제 카드
│   ├── FilterPanel.tsx # 좌측 필터 패널
│   └── CompareModal.tsx # 비교 모달 (최대 3개)
├── lib/
│   ├── types.ts        # Plan, FilterState 타입
│   └── plans.ts        # 목업 데이터 + 필터/정렬 로직
└── public/
    └── manifest.json   # PWA 설정
```

## 다음 단계

### Phase 2 — 백엔드 연동
- `lib/plans.ts`의 `MOCK_PLANS`를 API 호출로 교체
- `app/api/plans/route.ts` 추가 (Next.js API Routes)
- PostgreSQL + Prisma로 DB 연결

### Phase 3 — 앱스토어 출시

**Android (Google Play, TWA)**
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-app.vercel.app/manifest.json
bubblewrap build
```

**iOS (App Store, Capacitor)**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init SIMsaver com.simsaver.app
npx cap add ios
npx cap open ios   # Xcode에서 빌드 후 제출
```

## 환경변수

`.env.local` 파일을 만들어 설정하세요:

```
# 백엔드 API (Phase 2 이후)
NEXT_PUBLIC_API_URL=https://api.simsaver.app

# Anthropic API (AI 파싱 보조)
ANTHROPIC_API_KEY=sk-ant-...

# DB (Phase 2)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```
