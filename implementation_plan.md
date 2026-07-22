# ClockTest 구현 계획서

## 프로젝트 개요

- **위치**: `e:\알바\ClockTest`
- **원본**: GuGuDan 프로젝트에서 필요한 파일만 복사 (원본 미수정)
- **스택**: React + TypeScript + Vite + Tailwind + Supabase (기존과 동일)
- **목표**: 아날로그 시계 읽기 연습 앱 (8단계 난이도, 20문제, Supabase 연동 선생님 페이지)

---

## 컬러 팔레트: Beach Sunset

| 이름 | HEX | 용도 |
|------|-----|------|
| Frozen Water | `#BEE9E8` | 배경, 카드 배경 |
| Pacific Blue | `#62B6CB` | 주요 액션 버튼, 강조 |
| Yale Blue | `#1B4965` | 텍스트, 시계 테두리, 제목 |
| Pale Sky | `#CAE9FF` | 보조 배경, 입력 필드 |
| Fresh Sky | `#5FA8D3` | 호버, 중간 강조 |

→ `tailwind.config.js`와 `src/index.css`의 Golden Summer Fields 컬러를 위 팔레트로 교체

---

## 시계 페이스 (ClockFace) 설계

### 파일: `src/components/clock/ClockFace.tsx`

### SVG 구조 (viewBox="0 0 200 200")

- **60개 분 눈금 전부 표시** — 학생이 분 단위를 세어볼 수 있도록
- **눈금 3단계**: 시간 눈금(12개, 굵음) / 5분 눈금(사이 틱, 중간) / 1분 눈금(60개 전체, 가는 선)
- **숫자**: 1~12 (굵고 선명)
- **입체감**: 테두리 그림자, 약간의 그라데이션으로 사실적 느낌

### 시계 바늘

| 바늘 | 색상 | 굵기 | 길이 | 표시 조건 |
|------|------|------|------|-----------|
| 시침 (짧은 바늘) | `#E53935` (빨강) | 6px | 반지름 50% | 항상 |
| 분침 (긴 바늘) | `#1E88E5` (파랑) | 4px | 반지름 75% | 항상 (1단계 포함, 12시 고정) |
| 초침 | `#43A047` (녹색) | 1.5px | 반지름 85% | 7단계 이상 |
| 중심점 | `#1e293b` | r=5 | - | 항상 |

### 바늘 각도 계산

```typescript
const hourAngle = ((h % 12) + m / 60 + s / 3600) * 30;
const minuteAngle = (m + s / 60) * 6;
const secondAngle = s * 6;
```

### Props

```typescript
interface ClockFaceProps {
  hour: number;        // 1~12
  minute: number;      // 0~59
  second: number;      // 0~59
  showSecondHand: boolean;  // 7단계 이상
}
```

---

## 난이도 8단계

| 단계 | 설명 | 분 생성 규칙 | 초 생성 규칙 | 초침 | 입력 필드 |
|------|------|-------------|-------------|------|-----------|
| 1 | 정각 | 0 고정 | 0 | ❌ | `[ ]시` |
| 2 | 30분 단위 | 30 고정 | 0 | ❌ | `[ ]시 [ ]분` |
| 3 | 15/30/45분 | {15, 30, 45} | 0 | ❌ | `[ ]시 [ ]분` |
| 4 | 10분 단위 | {0,10,20,30,40,50} | 0 | ❌ | `[ ]시 [ ]분` |
| 5 | 5분 단위 | 5의 배수 (0~55) | 0 | ❌ | `[ ]시 [ ]분` |
| 6 | 1분 단위 | 0~59 | 0 | ❌ | `[ ]시 [ ]분` |
| 7 | 5분 + 초 | 5의 배수 | 5의 배수 | ✅ | `[ ]시 [ ]분 [ ]초` |
| 8 | 1분 + 초 | 0~59 | 0~59 | ✅ | `[ ]시 [ ]분 [ ]초` |

### 문제 생성기: `src/game/clockProblemGenerator.ts`

```typescript
interface ClockProblem {
  h: number;   // 1~12
  m: number;   // 0~59
  s: number;   // 0~59
}

function generateClockProblem(level: number): ClockProblem {
  const h = Math.floor(Math.random() * 12) + 1;
  let m = 0, s = 0;
  switch (level) {
    case 1: m = 0; break;
    case 2: m = 30; break;
    case 3: m = [15, 30, 45][Math.floor(Math.random() * 3)]; break;
    case 4: m = Math.floor(Math.random() * 6) * 10; break;
    case 5: m = Math.floor(Math.random() * 12) * 5; break;
    case 6: m = Math.floor(Math.random() * 60); break;
    case 7: m = Math.floor(Math.random() * 12) * 5;
            s = Math.floor(Math.random() * 12) * 5; break;
    case 8: m = Math.floor(Math.random() * 60);
            s = Math.floor(Math.random() * 60); break;
  }
  return { h, m, s };
}
```

---

## 화면 흐름

```
시작화면 (이름/지점) → 난이도 선택 (1~8단계) → 시계 풀기 (20문제) → 결과 화면
                                                                    ↓
                                                              Supabase 저장
                   선생님 페이지 (?admin=true) ← 반 선택 + 반 비밀번호
```

### 시계 풀기 화면 레이아웃

```
┌─────────────────────────────────────────────┐
│  [나가기]  ████████████░░░░  3 / 20         │  ← 프로그레스 바
├──────────────────┬──────────────────────────┤
│                  │                          │
│                  │    [ 3 ] 시  [ 15 ] 분   │  ← 시/분/초 입력
│    ┌────────┐    │                          │
│    │  SVG   │    │    ┌───┬───┬───┐        │
│    │  시계  │    │    │ 7 │ 8 │ 9 │        │
│    │  ⏰    │    │    ├───┼───┼───┤        │
│    │        │    │    │ 4 │ 5 │ 6 │   키패드│
│    └────────┘    │    ├───┼───┼───┤        │
│                  │    │ 1 │ 2 │ 3 │        │
│    ⭕ / ❌       │    ├───┼───┼───┤        │
│  (오답시 정답표시)│    │⌫ │ 0 │입력│        │
│                  │    └───┴───┴───┘        │
└──────────────────┴──────────────────────────┘
   왼쪽 55%              오른쪽 45%
```

### 입력 자동 이동 (clock1.html 참조)

1. `시` 입력 완료 → 자동으로 `분` 필드로 포커스 이동
2. `분` 입력 완료 → 7단계 이상이면 `초`로 이동, 아니면 자동 채점
3. `초` 입력 완료 → 자동 채점 (600ms 디바운스)
4. 정답 시 ⭕, 오답 시 ❌ + 정답 표시 피드백 (1초)
5. 다음 문제로 자동 진행

---

## Supabase 연동

- `supabase.ts`의 `book_title` 필터: `'TES 구구단'` → `'TES 시계'`
- `math_results` 테이블 그대로 사용 (스키마 변경 없음)
- `unit_title`: `"CLOCK_L1"` ~ `"CLOCK_L8"`
- `unit_display_name`: `"정각 단위"`, `"30분 단위"` 등
- 선생님 페이지: 기존 admin 구조 유지, 필터만 변경

---

## 설정 화면 (SettingsScreen)

| 항목 | 유지/제거 |
|------|-----------|
| 역방향 문제 포함 | ❌ 제거 |
| 효과음 on/off + 볼륨 | ✅ 유지 |
| 속도 조절 | ❌ 제거 |
| 전체화면 | ✅ 유지 |
| 데이터 초기화 | ✅ 유지 |

---

## 수정 대상 파일 (복사된 파일 중)

| 파일 | 수정 내용 |
|------|-----------|
| `tailwind.config.js` | Beach Sunset 팔레트로 교체 |
| `index.css` | CSS 변수 교체 |
| `index.html` | 제목, meta 변경 |
| `package.json` | name, deploy repo |
| `vite.config.ts` | PWA manifest |
| `App.tsx` | 화면 라우팅 |
| `gameStore.ts` | 시계 상태로 전환 |
| `game/types.ts` | 시계 문제 타입 |
| `GameScreen.tsx` | 왼쪽: 시계 + 프로그레스 바 |
| `CurriculumSelectScreen.tsx` | 8단계 난이도 그리드 |
| `InputPanel.tsx` | 시/분/초 입력 + 타이머/BGM 제거 |
| `Keypad.tsx` | submit 핸들러 수정 |
| `StartScreen.tsx` | 제목 변경 |
| `ResultScreen.tsx` | 시계 결과 |
| `SettingsScreen.tsx` | 불필요 옵션 제거 |
| `SharedMathReport.tsx` | 시계 리포트 |
| `supabase.ts` | book_title 필터 |
| `admin/*.tsx` | 필터 변경 |
| `storage.ts` | 키 prefix 변경 |
| `sound.ts` | BGM 관련 제거 |
| `useSound.ts` | BGM 관련 제거 |

## 새로 생성할 파일

| 파일 | 내용 |
|------|------|
| `src/components/clock/ClockFace.tsx` | SVG 아날로그 시계 |
| `src/game/clockProblemGenerator.ts` | 8단계 문제 생성 |
