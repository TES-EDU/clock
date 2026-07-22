# ClockTest Handout — 시계 보기 연습 앱

## 프로젝트 요약

초등학생 대상 아날로그 시계 읽기 연습 앱.  
SVG 아날로그 시계를 보고 시/분/초를 키패드로 입력하여 학습.

## 원본 프로젝트

- **GuGuDan** (`e:\알바\GuGuDan`) 에서 구조 복사
- 게임 전용 파일(산성비, 하트, 콤보 등) 제외하고 레이아웃·키패드·입력·admin 페이지 재활용
- **GuGuDan 원본은 수정하지 않음**

## 기술 스택

- React 18 + TypeScript
- Vite + vite-plugin-pwa
- Tailwind CSS 3
- Zustand (상태 관리)
- Supabase (결과 저장, 선생님 페이지)
- lucide-react (아이콘)

## 컬러 팔레트: Beach Sunset

| 이름 | HEX | 용도 |
|------|-----|------|
| Frozen Water | `#BEE9E8` | 배경, 카드 |
| Pacific Blue | `#62B6CB` | 주요 버튼, 강조 |
| Yale Blue | `#1B4965` | 텍스트, 제목, 시계 테두리 |
| Pale Sky | `#CAE9FF` | 보조 배경, 입력 필드 |
| Fresh Sky | `#5FA8D3` | 호버, 중간 강조 |

## 핵심 기능

### 1. 시계 페이스 (SVG)
- 60개 분 눈금 전부 표시 (1분 마다 점/선)
- 5분 눈금 강조, 12시간 숫자
- 시침(빨강)/분침(파랑)/초침(녹색)
- 분침은 1단계에서도 12시 고정으로 표시
- 사실적 디자인 (그림자, 입체감)

### 2. 난이도 8단계
1. 정각 → `[ ]시`
2. 30분 고정 → `[ ]시 [ ]분`
3. 15/30/45분 → `[ ]시 [ ]분`
4. 10분 단위 → `[ ]시 [ ]분`
5. 5분 단위 → `[ ]시 [ ]분`
6. 1분 단위 → `[ ]시 [ ]분`
7. 5분+초 단위 → `[ ]시 [ ]분 [ ]초`
8. 1분+초 단위 → `[ ]시 [ ]분 [ ]초`

### 3. 문제 풀기 흐름
- 20문제 고정 + 프로그레스 바
- 시/분/초 입력 자동 이동 (시→분→초)
- 600ms 디바운스 후 자동 채점
- 정답 ⭕ / 오답 ❌ + 정답 표시 (1초 피드백)
- 결과 화면 → Supabase 저장

### 4. Supabase 연동
- `math_results` 테이블 공유 (book_title = 'TES 시계')
- 선생님 페이지: 반 선택 후 해당 반 비밀번호 입력, 학생별 기록 조회
- 학원 코드 시스템 그대로 유지

### 5. 레이아웃 (가로 모드)
- 왼쪽 55%: SVG 시계 + 피드백 오버레이
- 오른쪽 45%: 시/분/초 입력 필드 + 숫자 키패드
- 상단: 프로그레스 바 (n / 20)

## 참조 파일

- `clock1.html` (`C:\Users\82107\Documents\카카오톡 받은 파일\`) — 구동 방식 예시
- `implementation_plan.md` (이 폴더) — 상세 구현 계획

## 복사된 파일 구조

```
ClockTest/
├── index.html
├── package.json, vite.config.ts, tailwind.config.js, tsconfig.*, postcss, eslint, .gitignore
├── implementation_plan.md  ← 구현 계획
├── handout.md              ← 이 파일
├── public/
│   ├── 온글잎 박다현체.ttf, favicon.svg, icons.svg
│   └── icons/icon-192x192.png, icon-512x512.png
└── src/
    ├── main.tsx, App.tsx, App.css, index.css
    ├── lib/supabase.ts
    ├── stores/gameStore.ts
    ├── hooks/useOrientation.ts, useSound.ts
    ├── utils/sound.ts, storage.ts
    ├── game/types.ts
    ├── components/
    │   ├── input/Keypad.tsx, InputPanel.tsx, CurrentInput.tsx
    │   ├── clock/  ← 새로 만들 폴더 (ClockFace.tsx)
    │   └── screens/
    │       ├── StartScreen, CurriculumSelect, GameScreen, ResultScreen
    │       ├── SettingsScreen, PortraitWarning, SharedMathReport
    │       └── admin/MathAdminPage, MathStudentHistory
    └── (새로 만들 파일: game/clockProblemGenerator.ts)
```
