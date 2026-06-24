# 찰칵밥상 Frontend

찰칵밥상은 사용자가 가진 재료를 기반으로 만들 수 있는 레시피를 추천하고, 직접 등록한 레시피를 피드에서 공유하는 Vue 3 SPA입니다. 프론트엔드는 Vercel에서 정적 SPA로 배포되며, `/api`와 `/media` 요청은 `vercel.json` rewrite를 통해 Django REST API로 전달합니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Framework | Vue 3, Vue Router |
| Build | Vite, TypeScript, vue-tsc |
| Styling | Tailwind CSS |
| API | Fetch 기반 `apiRequest`, Vercel Rewrite Proxy |
| Test | Vitest, Vitest Browser, Playwright |
| Deploy | Vercel |

## 주요 기능

- 홈: 인기 레시피, 추천 레시피, 최근 마이 레시피 요약
- 피드: 레시피 목록, 태그/검색/정렬, 무한 스크롤
- 레시피 상세: 재료, 조리 단계, 좋아요, 저장, 댓글, 답글
- 레시피 등록/수정: 이미지 업로드, 재료/단계 입력, 태그 설정
- 추천: 보유 재료 기반 추천 결과, 부족 재료 표시
- 인증: 이메일 로그인/회원가입, Google OAuth callback, JWT 저장/갱신
- 마이페이지: 내 레시피, 저장/좋아요 레시피, 구독/알림 흐름

## 실행 방법

```bash
npm install
npm run dev
```

빌드와 테스트는 아래 명령으로 확인합니다.

```bash
npm run build
npm run test
npm run test:e2e
```

## 환경 변수

`.env.example`을 복사해 `.env`를 만들고 필요한 값을 채웁니다.

```bash
cp .env.example .env
```

| 이름 | 설명 |
| --- | --- |
| `VITE_API_BASE_URL` | API base path. Vercel rewrite를 쓰면 `/api` 유지 |
| `VITE_FOODSAFETY_API_KEY` | 식품안전나라 공공 레시피 API 키 |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID |
| `VITE_GOOGLE_REDIRECT_URI` | Google OAuth redirect URI. 비우면 `/oauth/callback` 사용 |

식품안전나라 API 키는 코드에 하드코딩하지 않습니다. 키가 없으면 프론트는 해당 공공 API 호출을 건너뛰고 Django API 또는 로컬 fallback 데이터를 사용합니다.

## API 연동

프론트 API 클라이언트는 `src/shared/api/client.ts`의 `apiRequest`를 통해 백엔드와 통신합니다.

- `/api/auth/*`: 로그인, 회원가입, 토큰 갱신, Google OAuth
- `/api/recipes/*`: 레시피 CRUD, 좋아요, 저장, 댓글, 재료 검색, 추천
- `/api/feeds/*`: 피드 목록, 태그 조회
- `/api/users/*`: 내 정보, 저장/좋아요/작성 레시피, 구독
- `/api/media/*`: 이미지 업로드, 재료 감지 결과
- `/api/notifications/*`: 알림 목록과 읽음 처리

Vercel 배포 환경에서는 `vercel.json`이 `/api/(.*)`와 `/media/(.*)` 요청을 Django 서버로 전달합니다. 브라우저가 EC2 HTTP API를 직접 호출하지 않도록 `VITE_API_BASE_URL`은 기본값 `/api`를 유지합니다.

## Fixture 데이터

프론트 제출 증빙용 fixture는 `src/features/recipe/fixtures.ts`에 있습니다.

- `recipeFixtures`: 찰칵밥상 도메인의 레시피 데이터 50개
- `recipeFixtureMeta`: fixture 출처, 도메인, 개수 메타데이터

이 파일은 TypeScript에서 바로 import할 수 있는 loadable fixture입니다.

```ts
import { recipeFixtures, recipeFixtureMeta } from './src/data'

console.log(recipeFixtureMeta.count) // 50
console.log(recipeFixtures[0].title) // 김치볶음밥
```

## 페이지 구성

Vue Router 기준 주요 페이지는 다음과 같습니다.

- `/`: 홈
- `/feed`: 레시피 피드
- `/recipe/:id`: 레시피 상세
- `/my-recipe/new`: 레시피 등록
- `/my-recipe/:id/edit`: 레시피 수정
- `/saved`: 저장한 레시피
- `/mypage`: 마이페이지
- `/login`, `/signup`, `/oauth/callback`: 인증
- `/recommendations`: 재료 기반 추천
- `/ingredients`: 재료 선택/감지
- `/backend-api`: 프론트-백엔드 API 명세

## CI/CD 흐름

1. GitHub 저장소에 프론트 소스를 push합니다.
2. 테스트/검증 단계에서 Vitest와 Playwright 테스트를 실행합니다.
3. Vercel이 `npm run build`를 실행하고 `dist`를 배포합니다.
4. 배포된 Vue 3 SPA는 `/api`, `/media` rewrite로 백엔드 API와 연결됩니다.

## 과제 필수요건 매핑

| 필수요건 | 프론트 대응 |
| --- | --- |
| 추천 기능 | `/recommendations`, 재료 기반 추천 API 연동 |
| API 활용 | 식품안전나라 API 이미지/레시피 조회, Google OAuth, Django REST API |
| 커뮤니티 | 피드, 좋아요, 저장, 댓글, 답글, 알림 UI |
| RESTful 원칙 | 리소스 중심 API client와 `/backend-api` 명세 |
| 5개 이상 페이지 | 홈, 피드, 상세, 등록, 저장, 마이, 로그인, 추천 등 |
| API Key 관리 | Vite `.env` 기반 관리, 하드코딩 fallback 제거 |
| 데이터 | `recipeFixtures` 50개 + 백엔드 식품안전나라 import 데이터와 연동 |
