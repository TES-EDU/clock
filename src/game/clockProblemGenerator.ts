export interface ClockProblem {
  h: number;   // 1~12
  m: number;   // 0~59
  s: number;   // 0~59
}

export function generateClockProblem(level: number): ClockProblem {
  // 1~12 사이의 랜덤 시간 생성
  const h = Math.floor(Math.random() * 12) + 1;
  let m = 0;
  let s = 0;

  switch (level) {
    case 1:
      m = 0;
      s = 0;
      break;
    case 2:
      m = 30;
      s = 0;
      break;
    case 3:
      m = [15, 30, 45][Math.floor(Math.random() * 3)];
      s = 0;
      break;
    case 4:
      m = Math.floor(Math.random() * 6) * 10; // 0, 10, 20, 30, 40, 50
      s = 0;
      break;
    case 5:
      m = Math.floor(Math.random() * 12) * 5;  // 0, 5, 10, ..., 55
      s = 0;
      break;
    case 6:
      m = Math.floor(Math.random() * 60);      // 0~59
      s = 0;
      break;
    case 7:
      m = Math.floor(Math.random() * 12) * 5;  // 5분 단위
      s = Math.floor(Math.random() * 12) * 5;  // 5분 단위 (초)
      break;
    case 8:
      m = Math.floor(Math.random() * 60);      // 1분 단위
      s = Math.floor(Math.random() * 60);      // 1초 단위
      break;
    default:
      m = 0;
      s = 0;
  }

  return { h, m, s };
}

export function getLevelDisplayName(level: number): string {
  const names = [
    "정각 단위",
    "30분 단위",
    "15분/30분/45분",
    "10분 단위",
    "5분 단위",
    "1분 단위",
    "5분 + 초 단위",
    "1분 + 초 단위"
  ];
  return names[level - 1] || "시계 보기";
}
