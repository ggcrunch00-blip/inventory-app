# 국토 수호대 디지털 인벤토리 앱

초등학교 5학년 수업용 Chromebook 환경을 가정한 교실 보상 웹앱 MVP입니다.  
학생은 한 학기 동안 같은 계정을 사용하고, 캐릭터를 한 번만 선택한 뒤 수업 점수로 아이템을 얻어 12칸 인벤토리에 보관합니다. 인벤토리가 가득 찼다면 반드시 기존 아이템 1개를 버린 뒤 새 아이템을 받아야 합니다.

## 핵심 기능

- 학생 로그인: 학년 / 반 / 번호 / 4자리 비밀번호
- 첫 로그인 시 캐릭터 1회 선택
- 학생 대시보드: 캐릭터, 현재 차시, 12칸 인벤토리, 최근 획득/버리기 기록
- 보상 화면: 오늘 점수 입력, 구매/보너스 아이템 선택, 남은 점수 확인, 확정 시 잔여 점수 소멸
- 학생 기록 화면: 점수 입력, 구매, 보너스, 버리기 로그 확인
- 선생님 관리 화면:
  - 학생 등록 / 수정 / 삭제
  - 학생 비밀번호 재설정
  - 학생 캐릭터 초기화
  - 학생 인벤토리 보기 / 인벤토리 칸 제거
  - 아이템 등록 / 수정 / 삭제
  - 차시 등록 / 수정 / 삭제
  - 전체 보너스 지급 / 개별 보너스 지급
- Firebase Firestore 연동 구조 포함
- Firebase 설정이 없을 때는 로컬 목업(LocalStorage) 모드로 바로 체험 가능

## 기술 스택

- React
- Vite
- JavaScript
- Firebase Firestore
- React Router

## 시작 방법

### 1. Node.js 설치

이 프로젝트는 `Node.js 18+` 또는 `Node.js 20+` 환경을 권장합니다.

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 Vite가 출력한 주소를 열면 됩니다. 보통 `http://localhost:5173` 입니다.

### 4. 배포용 빌드

```bash
npm run build
```

## Firebase 연결

`.env.example`을 복사해 `.env`를 만들고 Firebase 웹 앱 설정 값을 채워 주세요.

```bash
cp .env.example .env
```

Windows PowerShell에서는 아래처럼 만들 수 있습니다.

```powershell
Copy-Item .env.example .env
```

필수 환경 변수:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

환경 변수가 모두 채워지면 Firestore 모드로 동작합니다.  
비어 있으면 자동으로 로컬 목업 모드로 동작합니다.

## Firestore 컬렉션 구조

상세한 필드 설명은 [docs/firestore-schema.md](/C:/Users/dlgks/Desktop/Codex/inventory-app/docs/firestore-schema.md)에 정리했습니다.

기본 컬렉션:

- `classrooms`
- `students`
- `items`
- `sessions`
- `logs`
- `admins`

추천 문서 ID:

- `classrooms/main`
- `admins/teacher`
- `students/g5-c1-s01`

## 로컬 체험 계정

Firebase 설정 없이 바로 확인할 때:

- 학생 1: `5학년 / 1반 / 1번 / 1111`
- 학생 2: `5학년 / 1반 / 2번 / 2222`
- 선생님: `teacher / 1234`

## 수정해야 할 주요 파일

### 1. 학생 시드 데이터

- [src/data/mockSeed.js](/C:/Users/dlgks/Desktop/Codex/inventory-app/src/data/mockSeed.js)

이 파일에서 학생, 아이템, 차시, 관리자 예시 데이터를 한 번에 바꿀 수 있습니다.  
Firebase를 붙이기 전 로컬 데모용 기본 데이터도 이 파일을 기준으로 생성됩니다.

### 2. 아이템 데이터

- [src/data/mockSeed.js](/C:/Users/dlgks/Desktop/Codex/inventory-app/src/data/mockSeed.js)

`items` 배열에서 이름, 설명, 가격, 이미지 경로, 종류, 적용 차시를 수정하세요.

### 3. Firebase 설정

- [.env.example](/C:/Users/dlgks/Desktop/Codex/inventory-app/.env.example)
- [src/services/firebase.js](/C:/Users/dlgks/Desktop/Codex/inventory-app/src/services/firebase.js)

실제 프로젝트에서는 `.env.example`을 참고해 `.env`를 만들고 Firebase 프로젝트 값을 넣으면 됩니다.

### 4. 이미지 에셋 교체

- [public/assets/characters](/C:/Users/dlgks/Desktop/Codex/inventory-app/public/assets/characters)
- [public/assets/items](/C:/Users/dlgks/Desktop/Codex/inventory-app/public/assets/items)

현재는 SVG 플레이스홀더가 들어 있습니다.  
PPT에서 추출한 실제 이미지를 같은 경로와 파일명으로 덮어쓰거나, 아이템/캐릭터의 `imageUrl`을 새 파일명으로 바꾸면 됩니다.

## 프로젝트 구조

```text
inventory-app/
├─ public/
│  └─ assets/
│     ├─ characters/
│     └─ items/
├─ src/
│  ├─ components/
│  │  └─ common/
│  ├─ contexts/
│  ├─ data/
│  ├─ hooks/
│  ├─ layouts/
│  ├─ pages/
│  │  ├─ admin/
│  │  └─ student/
│  ├─ services/
│  ├─ styles/
│  └─ utils/
├─ docs/
├─ .env.example
├─ index.html
├─ package.json
└─ vite.config.js
```

## 화면 설명

### 학생 화면

- `/login`: 학생 로그인
- `/student/characters`: 첫 로그인 캐릭터 선택
- `/student/dashboard`: 학생 대시보드
- `/student/reward`: 오늘 점수 기반 아이템 획득
- `/student/history`: 활동 기록

### 선생님 화면

- `/admin/login`: 관리 로그인
- `/admin/dashboard`: 운영 요약
- `/admin/students`: 학생 관리
- `/admin/items`: 아이템 관리
- `/admin/sessions`: 차시 관리

## 오프라인 / 안정성 메모

- Firebase 연결 시 Firestore 오프라인 캐시 사용을 시도합니다.
- 브라우저가 오프라인이어도 즉시 저장 시도를 하고, 연결이 돌아오면 자동 동기화를 기대하는 구조입니다.
- 저장 상태 배너를 한국어로 표시합니다.
- 보상 확정은 한 번에 로그와 인벤토리를 반영하도록 설계했습니다.

## 보안 메모

현재 MVP는 요구사항에 맞춰 학생 비밀번호를 앱이 직접 다루는 단순 구조입니다.  
실제 외부 공개 배포에서는 다음 보강을 권장합니다.

- 교사용 계정은 Firebase Authentication으로 분리
- 학생 로그인 검증은 Cloud Functions 또는 별도 백엔드로 이전
- Firestore 보안 규칙 강화
- 4자리 비밀번호 평문 저장 대신 해시 또는 서버 검증 도입

## 구현 메모

- 학생 흐름을 우선 구현했습니다.
- 차시가 닫혀 있으면 학생 보상 화면에서 명확히 안내합니다.
- 인벤토리는 항상 12칸을 고정으로 표시합니다.
- 인벤토리가 가득 찼을 때는 버릴 칸을 먼저 고르게 했습니다.
- 선생님 관리 화면에서 실수 수정을 위해 인벤토리 칸 삭제 기능을 넣었습니다.

## 이 환경에서 확인하지 못한 것

현재 작업 환경에는 Node.js / npm이 설치되어 있지 않아 여기서 `npm install`, `npm run dev`, `npm run build`를 직접 실행해 검증하지는 못했습니다.  
코드는 실행 가능한 Vite 구조로 작성했으며, 로컬 PC에 Node 설치 후 바로 실행할 수 있도록 구성했습니다.

