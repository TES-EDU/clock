export type ScreenType =
  | 'start'
  | 'curriculumSelect'
  | 'game'
  | 'result'
  | 'settings';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameOver' | 'result';

export interface SoundSettings {
  enabled: boolean;
  volume: number;
}

export interface Problem {
  id: string;
  h: number;
  m: number;
  s: number;
  expression: string;
  answer: number; // Encoded: h or (h*100 + m) or (h*10000 + m*100 + s)
}

export interface ProblemResult {
  problemId: string;
  expression: string;
  correctAnswer: number;
  userAnswer: number | null;
  result: 'correct' | 'wrong' | 'missed';
  tags: string[];
}
