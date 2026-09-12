## K-Saju

K-Saju는 외국인 관광객과 한국의 전통 점술(사주/타로) 전문가를 연결하는 플랫폼입니다. 실시간 통역(LLM), 위치 기반 체험, 일정 관리, 다국어 지원을 통해 언어 장벽 없이 한국 문화 점술 체험을 제공합니다.

## 기술 스택 (npm install을 모두 해줘야 함)
- **Frontend**: React + Vite + TypeScript, styled-components, Tailwind(PostCSS)
- **라우팅**: react-router-dom
- **백엔드**: Supabase(Auth, Storage, Postgres)
- **품질**: ESLint, TypeScript
- **아이콘**: Heroicons

## 주요 페이지
- `/` 홈(랜딩)
- `/locations` 체험/위치 목록 + 지도(Seoul)
- `/profile` 프로필(아바타 업로드: Supabase Storage)
- `/messages` 메시지(향후)
- `/support`, `/faq` 고객지원/FAQ
- `/sign-in`, `/sign-up` 로그인/회원가입
- `/kakao-callback` 카카오 OAuth 콜백
- `/live-translation` 실시간 통역 기능 - 승우님 작업 중

## 환경 변수(.env)는 Vercel 쪽에 설정

- 로컬: `.env.development` 사용 가능
- 배포: Vercel 프로젝트의 Environment Variables(Production/Preview)에 동일 키를 등록

## 실행 방법(로컬 개발)
1) 의존성 설치
```bash
npm i
```

2) 개발 서버 실행 (로컬에서 웹사이트 확인)
```bash
npm run dev
```

3) 빌드 확인(선택)
```bash
npm run build
```

3) 배포
```bash
npm run deploy
```


## 데이터베이스 스키마/시드(필수)
`places`/`locations` 테이블과 RLS 정책, 목데이터(30+ 항목)를 한 번에 생성하는 SQL을 Supabase SQL Editor에서 실행하세요.

- 생성 개요
  - Enums: `activity_level`(`LIGHT|MODERATE|INTENSE`), `skill_level`(`BEGINNER|INTERMEDIATE|ADVANCED`)
  - Tables: `public.places`, `public.locations`
  - RLS: 공개 읽기(SELECT), 인증 사용자 쓰기/관리(ALL)
  - Seed: 10개 장소 + 30개 체험 레코드

예시(요약):
```sql
-- Extensions
create extension if not exists pgcrypto;

-- Enums
DO $$ BEGIN CREATE TYPE activity_level AS ENUM ('LIGHT','MODERATE','INTENSE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE skill_level AS ENUM ('BEGINNER','INTERMEDIATE','ADVANCED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables(요약)
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  city text not null,
  district text,
  postal_code text,
  address_line text,
  place_label text unique,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tagline text,
  image_url text not null,
  price_krw integer not null,
  activity_level activity_level not null,
  skill_level skill_level not null,
  max_guests_total integer not null,
  min_age integer,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.places enable row level security;
alter table public.locations enable row level security;
DO $$ BEGIN CREATE POLICY "public can read places" ON public.places FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "auth can manage places" ON public.places FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "public can read locations" ON public.locations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "auth can manage locations" ON public.locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

## 프론트엔드 데이터 연동
- Supabase SDK 초기화: `src/supabase.ts`
- 위치/체험 목록: `src/routes/locations.tsx`가 DB에서 `places`, `locations`를 읽어 지도+리스트로 렌더링
  - 지도 가격 태그: 검은색 배경/흰색 텍스트
  - 리스트/그리드 전환 버튼: 테두리/호버/포커스 개선
  - 지도/리스트 폭: 세로 리사이저로 400–640px 구간에서 가변 조절(지도 확장 시 전체 화면)

## 배포(Vercel)
사전 준비: Vercel CLI 로그인(`vercel login`), 프로젝트 연결 -> Vercel에 초대를 하려면 돈을 내야돼서 보류

- SPA 라우팅: 루트에 `vercel.json` 존재해야 함
```json
{
  "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ]
}
```
## 폴더 구조(요약)
```
src/
  components/ (레이아웃, GNB, ProtectedRoute 등) # 글로벌 컴포넌트 (네비게이션 바 등)
  routes/ (home, locations, profile, sign_in, sign_up, kakao_callback ...)  # 각종 화면 및 프론트엔드 구현
  i18n/                # 로컬라이제이션
  supabase.ts          # Supabase 클라이언트
public/
dist/                  # 빌드 산출물
vercel.json            # SPA 리라이트
```

## 마이그레이션 참고(요약)
- Firebase → Supabase로 전환(Auth/Storage/DB)
- Firebase Data Connect, Hosting 등은 더 이상 사용하지 않음
- 아바타 업로드: Supabase Storage `avatars` 버킷 사용
- 클라이언트 상태: `supabase.auth.getSession()`, `onAuthStateChange` 사용
