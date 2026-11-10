# CLAUDE.md

투네이션 크리에이터 스튜디오 · 위젯 · 라이브 방송 화면을 기획 검증용으로 만든 **목업(프로토타입)** 저장소다.
실제 서버 연동 없이 목업 데이터로 화면과 동작을 보여주는 것이 목적이다.

## 작업 규칙

- **소통 언어**: 답변, 커밋 메시지, PR 제목·본문, 코드 주석은 모두 **한국어**로 쓴다.
- **브랜치**: main에 직접 커밋하지 않는다. 작업 브랜치에서 작업하고 푸시한다.
- **배포 = PR 병합**: main에 병합되면 Vercel이 production(https://total-mu.vercel.app)에 자동 배포한다.
  - 사용자가 "배포해줘"라고 하면: 작업 브랜치로 PR 생성 → **squash 병합** → Vercel 배포가 READY인지 확인한다.
  - PR 제목은 변경 내용을 한 줄로 요약한다 (예: `채팅 위젯 페이지를 대시보드 셸 안으로 구성 (/chat-widget.html)`). 병합 커밋 제목 끝에 ` (#번호)`를 붙인다.
  - 사용자가 배포를 요청하기 전에는 main에 병합하지 않는다.
- **미리보기 배포**: 작업 브랜치를 푸시하면 Vercel이 미리보기 배포를 자동으로 만든다.
  푸시 후 Vercel 배포 목록(브랜치 필터)에서 미리보기 URL을 찾아 사용자에게 알려주고, 확인을 받은 뒤 production에 배포한다.
- **수정사항이 여러 개일 때**: 번호 목록으로 받은 수정사항을 한 브랜치에서 모두 처리하고 배포는 한 번에 한다.
  끝나면 항목 번호별로 처리 결과(완료 / 보류 + 이유)를 정리해 보고한다.
- **사용자의 직접 업로드**: 사용자가 GitHub 웹에서 main에 파일을 직접 올리기도 한다("Add files via upload" 커밋).
  작업 시작 전과 PR 생성 전에 `origin/main`을 fetch해서 최신 상태 위에서 작업한다.
- **확인**: 푸시 전에 `npm run lint`(= `tsc --noEmit`)와 `npm run build`가 통과해야 한다.
  화면 변경은 `npm run build && npx vite preview`로 띄워 Playwright 스크린샷으로 확인한다.
  `public/` 안의 파일은 빌드 결과(`dist/`)로 복사되므로, 수정 후에는 다시 빌드해야 preview에 반영된다.

## 기술 스택

- React 19 + TypeScript + Vite 6, 라우팅은 `react-router-dom` (`src/App.tsx`)
- 스타일: Tailwind CSS v4 (`@tailwindcss/vite`). 다크모드는 **`.dark` 클래스 전략**이다 (`src/index.css`의 `@custom-variant dark`). OS 다크모드(미디어쿼리)를 따르지 않는다.
- 아이콘: `lucide-react`
- 배포: Vercel. `vercel.json`이 모든 경로를 `/`(SPA)로 rewrite한다. 단, `public/`에 실제로 있는 정적 파일은 rewrite보다 먼저 그대로 서빙된다.
  → `public/foo.html` 파일이 있으면 `/foo.html` 경로는 React 라우트로 갈 수 없다.

## 명령어

```bash
npm install
npm run dev       # 개발 서버 (포트 3000)
npm run lint      # 타입 검사 (tsc --noEmit)
npm run build     # 프로덕션 빌드 → dist/
npx vite preview  # 빌드 결과 미리보기 (포트 4173)
```

## 구조

| 경로 | 화면 | 파일 |
|---|---|---|
| `/` | 전체 화면 위젯 (스튜디오) | `src/StudioPage.tsx` |
| `/dashboard` | 위젯 관리 > 통합 알림창 | `src/DashboardPage.tsx` |
| `/broadcast-manage` | 라이브 방송 > 방송 관리 | `DashboardPage` → `src/BroadcastSettingsPage.tsx` (`mode="manage"`) |
| `/broadcast-settings` | 라이브 방송 > 방송 설정 | `DashboardPage` → `src/BroadcastSettingsPage.tsx` (`mode="settings"`) |
| `/broadcast-analytics` | 라이브 방송 > 방송 분석 | `DashboardPage` → `src/BroadcastAnalyticsPage.tsx` |
| `/chat-widget.html`, `/chat-widget` | 위젯 관리 > 채팅 위젯 | `DashboardPage` → iframe으로 `public/chat-widget-app.html` |
| `/broadcast-manage/chat` | 방송 관리 채팅 팝업 | `src/ChatPopupPage.tsx` |
| `/admin` | 방송 관리자 페이지 (새 탭) | `src/AdminPage.tsx`, `src/admin/*` |
| `/creator` | 크리에이터 페이지 | `src/CreatorPage.tsx` |
| `/live`, `/live/:channelId` | 시청 · 채널 화면 | `src/LivePage.tsx`, `src/ChannelPage.tsx`, `src/ViewerShell.tsx`, `src/liveData.ts` |
| `/desktop/broadcast`, `/desktop/watch` | 데스크톱 방송/시청 | `src/BroadcastDesktopPage.tsx`, `src/WatchDesktopPage.tsx` |

- 채팅 관련 모듈: `src/creatorchat/`(크리에이터 채팅 패널), `src/viewerchat/`(시청자 채팅 패널)
- 로고: `src/Logo.tsx`

### 대시보드 셸 (`src/DashboardPage.tsx`)

크리에이터 스튜디오 화면은 하나의 셸(왼쪽 사이드바 + 상단 헤더)을 공유한다.

- 현재 화면은 state가 아니라 **URL 경로로 결정**한다 (`activePage`). 새로고침해도 유지된다.
- **새 메뉴 화면을 추가하는 방법**:
  1. `src/App.tsx`에 `<Route path="/새경로" element={<DashboardPage />} />` 추가
  2. `DashboardPage`의 `activePage` 타입과 경로 판별식에 항목 추가
  3. 사이드바 `SidebarMenuItem`에 `active` / `onClick={() => navigate('/새경로')}` 연결 (활성 표시용 파란 막대 `div`도 함께)
  4. 헤더 `<h1>` 제목 분기에 화면 이름 추가
  5. 콘텐츠 영역에 화면 컴포넌트 렌더링
- 헤더의 다크모드·알림·검색 버튼은 목업이라 동작하지 않는다.

### 채팅 위젯 (`public/chat-widget-app.html`)

- React가 아닌 **단일 정적 HTML 파일**(CSS·JS 인라인, 약 1,500줄)이다. 사용자가 직접 만들어 올린 파일이므로 구조를 유지하면서 수정한다.
- 대시보드 안에서는 iframe(`?embed=1`)으로 열린다. embed 모드에서는 자체 상단바를 숨기고 라이트 테마로 고정한다 (`<head>`의 embed 스크립트, `.embed` CSS).
  자체 상단바의 '설정 초기화' 버튼과 연결 상태 표시는 단독으로 열었을 때(`/chat-widget-app.html`)만 보인다.
- 설정 값은 `localStorage`에 저장된다. 화면 확인 시 이전 설정이 남아 있을 수 있다.
- 한 파일이므로 이 파일에 대한 여러 수정은 병렬로 나누지 말고 한 작업에서 순서대로 처리한다.
