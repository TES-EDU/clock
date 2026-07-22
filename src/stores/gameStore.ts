import { create } from 'zustand';
import type { Problem, ProblemResult, ScreenType, GameStatus } from '../game/types';
import { generateClockProblem } from '../game/clockProblemGenerator';
import { setBestScore } from '../utils/storage';

const INPUT_FIELD_PAUSE_MS = 2500;

interface GameStore {
  // Screen and Status
  screen: ScreenType;
  status: GameStatus;
  setScreen: (screen: ScreenType) => void;

  // Level
  levelId: string; // "1" ~ "8"
  setLevelId: (levelId: string) => void;

  // Sound Settings
  soundEnabled: boolean;
  soundVolume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;

  // Game States
  currentQuestionIndex: number;
  questions: Problem[];
  correctCount: number;
  wrongCount: number;
  missedCount: number;
  score: number;
  maxCombo: number;
  combo: number;
  answeredProblems: ProblemResult[];

  // Time Tracking
  startTime: number | null;
  elapsedSeconds: number;

  // User Inputs
  userHour: string;
  userMinute: string;
  userSecond: string;
  activeField: 'hour' | 'minute' | 'second';
  isShowingFeedback: boolean;
  feedbackResult: 'correct' | 'wrong' | null;

  // Auto Submission Timer
  autoSubmitTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  startGame: () => void;
  appendDigit: (digit: string) => void;
  deleteDigit: () => void;
  clearDigits: () => void;
  setActiveField: (field: 'hour' | 'minute' | 'second') => void;
  submitAnswer: () => void;
  triggerAutoSubmit: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  goToResult: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial States
  screen: 'start',
  status: 'ready',
  levelId: '1',

  soundEnabled: true,
  soundVolume: 0.7,

  currentQuestionIndex: 0,
  questions: [],
  correctCount: 0,
  wrongCount: 0,
  missedCount: 0,
  score: 0,
  maxCombo: 0,
  combo: 0,
  answeredProblems: [],

  startTime: null,
  elapsedSeconds: 0,

  userHour: '',
  userMinute: '',
  userSecond: '',
  activeField: 'hour',
  isShowingFeedback: false,
  feedbackResult: null,
  autoSubmitTimer: null,

  setScreen: (screen) => set({ screen }),
  setLevelId: (levelId) => set({ levelId }),

  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setSoundVolume: (volume) => set({ soundVolume: volume }),

  pauseGame: () => set({ status: 'paused' }),
  resumeGame: () => set({ status: 'playing' }),

  startGame: () => {
    // Clear any active timers
    const timer = get().autoSubmitTimer;
    if (timer) clearTimeout(timer);

    const { levelId } = get();
    const lvl = parseInt(levelId, 10) || 1;

    // Generate 20 problems
    const generatedProblems: Problem[] = [];
    for (let i = 0; i < 20; i++) {
      const prob = generateClockProblem(lvl);
      
      let expr = `${prob.h}시`;
      let ans = prob.h;
      if (lvl >= 2 && lvl <= 6) {
        expr = `${prob.h}시 ${prob.m}분`;
        ans = prob.h * 100 + prob.m;
      } else if (lvl >= 7) {
        expr = `${prob.h}시 ${prob.m}분 ${prob.s}초`;
        ans = prob.h * 10000 + prob.m * 100 + prob.s;
      }

      generatedProblems.push({
        id: `q_${i}_${Date.now()}`,
        h: prob.h,
        m: prob.m,
        s: prob.s,
        expression: expr,
        answer: ans,
      });
    }

    set({
      status: 'playing',
      screen: 'game',
      currentQuestionIndex: 0,
      questions: generatedProblems,
      correctCount: 0,
      wrongCount: 0,
      missedCount: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      userHour: '',
      userMinute: '',
      userSecond: '',
      activeField: 'hour',
      isShowingFeedback: false,
      feedbackResult: null,
      answeredProblems: [],
      autoSubmitTimer: null,
      startTime: Date.now(),
      elapsedSeconds: 0,
    });
  },

  appendDigit: (digit) => {
    const { activeField, userHour, userMinute, userSecond, levelId, questions, currentQuestionIndex, isShowingFeedback } = get();
    if (isShowingFeedback) return; // Block input during feedback

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const lvl = parseInt(levelId, 10);

    // A pending one-digit field completion is cancelled when the child
    // continues typing. This lets 5 become 53, while a short pause completes 5.
    const pendingTimer = get().autoSubmitTimer;
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      set({ autoSubmitTimer: null });
    }

    const afterInputPause = (action: () => void) => {
      const timer = setTimeout(() => {
        set({ autoSubmitTimer: null });
        action();
      }, INPUT_FIELD_PAUSE_MS);
      set({ autoSubmitTimer: timer });
    };

    const finishMinute = () => {
      if (lvl >= 7) {
        set({ activeField: 'second' });
      } else {
        get().triggerAutoSubmit();
      }
    };

    if (activeField === 'hour') {
      if (userHour.length === 0) {
        if (digit === '0') return;

        set({ userHour: digit });
        if (digit === '1') {
          afterInputPause(() => {
            if (lvl === 1) get().submitAnswer();
            else set({ activeField: 'minute' });
          });
        } else if (lvl === 1) {
          get().triggerAutoSubmit();
        } else {
          set({ activeField: 'minute' });
        }
        return;
      }

      if (userHour === '1' && ['0', '1', '2'].includes(digit)) {
        set({ userHour: `1${digit}` });
        if (lvl === 1) {
          get().triggerAutoSubmit();
        } else {
          set({ activeField: 'minute' });
        }
        return;
      }

      // 13~19 are not valid clock hours. Keep the completed "1시" and use
      // the following digit as the first minute digit instead.
      if (userHour === '1' && lvl > 1) {
        set({ userMinute: digit, activeField: 'minute' });
        if (Number(digit) >= 6) finishMinute();
        else afterInputPause(finishMinute);
      }
    } else if (activeField === 'minute') {
      const nextVal = userMinute + digit;
      if (nextVal.length > 2 || Number(nextVal) > 59) return;

      set({ userMinute: nextVal });
      if (nextVal.length === 2 || Number(nextVal) >= 6) {
        finishMinute();
      } else {
        afterInputPause(finishMinute);
      }
    } else if (activeField === 'second') {
      const nextVal = userSecond + digit;
      if (nextVal.length > 2 || Number(nextVal) > 59) return;

      set({ userSecond: nextVal });
      if (nextVal.length === 2 || Number(nextVal) >= 6) {
        get().triggerAutoSubmit();
      } else {
        afterInputPause(() => get().submitAnswer());
      }
    }
  },

  deleteDigit: () => {
    const { activeField, userHour, userMinute, userSecond, isShowingFeedback } = get();
    if (isShowingFeedback) return;

    // Clear auto-submit timer on delete
    const timer = get().autoSubmitTimer;
    if (timer) {
      clearTimeout(timer);
      set({ autoSubmitTimer: null });
    }

    if (activeField === 'hour') {
      set({ userHour: userHour.slice(0, -1) });
    } else if (activeField === 'minute') {
      if (userMinute.length === 0) {
        // Go back to hour
        set({ activeField: 'hour', userHour: userHour.slice(0, -1) });
      } else {
        set({ userMinute: userMinute.slice(0, -1) });
      }
    } else if (activeField === 'second') {
      if (userSecond.length === 0) {
        // Go back to minute
        set({ activeField: 'minute', userMinute: userMinute.slice(0, -1) });
      } else {
        set({ userSecond: userSecond.slice(0, -1) });
      }
    }
  },

  clearDigits: () => {
    const timer = get().autoSubmitTimer;
    if (timer) {
      clearTimeout(timer);
      set({ autoSubmitTimer: null });
    }

    set({
      userHour: '',
      userMinute: '',
      userSecond: '',
      activeField: 'hour',
    });
  },

  setActiveField: (field) => {
    const { isShowingFeedback } = get();
    if (isShowingFeedback) return;
    const timer = get().autoSubmitTimer;
    if (timer) clearTimeout(timer);
    set({ activeField: field, autoSubmitTimer: null });
  },

  triggerAutoSubmit: () => {
    const timer = get().autoSubmitTimer;
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(() => {
      get().submitAnswer();
    }, 600);

    set({ autoSubmitTimer: newTimer });
  },

  submitAnswer: () => {
    const timer = get().autoSubmitTimer;
    if (timer) {
      clearTimeout(timer);
      set({ autoSubmitTimer: null });
    }

    const {
      questions,
      currentQuestionIndex,
      userHour,
      userMinute,
      userSecond,
      levelId,
      correctCount,
      wrongCount,
      answeredProblems,
    } = get();

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const lvl = parseInt(levelId, 10);
    const hVal = parseInt(userHour, 10) || 0;
    const mVal = parseInt(userMinute, 10) || 0;
    const sVal = parseInt(userSecond, 10) || 0;

    let isCorrect = false;
    if (lvl === 1) {
      isCorrect = (hVal === currentQuestion.h);
    } else if (lvl <= 6) {
      isCorrect = (hVal === currentQuestion.h && mVal === currentQuestion.m);
    } else {
      isCorrect = (hVal === currentQuestion.h && mVal === currentQuestion.m && sVal === currentQuestion.s);
    }

    let encodedCorrect = currentQuestion.h;
    let encodedUser: number | null = hVal;
    if (lvl >= 2 && lvl <= 6) {
      encodedCorrect = currentQuestion.h * 100 + currentQuestion.m;
      encodedUser = userHour || userMinute ? hVal * 100 + mVal : null;
    } else if (lvl >= 7) {
      encodedCorrect = currentQuestion.h * 10000 + currentQuestion.m * 100 + currentQuestion.s;
      encodedUser = userHour || userMinute || userSecond ? hVal * 10000 + mVal * 100 + sVal : null;
    }

    const newResult: ProblemResult = {
      problemId: currentQuestion.id,
      expression: currentQuestion.expression,
      correctAnswer: encodedCorrect,
      userAnswer: encodedUser,
      result: isCorrect ? 'correct' : 'wrong',
      tags: [`level:${levelId}`],
    };

    const newCombo = isCorrect ? get().combo + 1 : 0;
    const newMaxCombo = Math.max(get().maxCombo, newCombo);

    set({
      isShowingFeedback: true,
      feedbackResult: isCorrect ? 'correct' : 'wrong',
      correctCount: isCorrect ? correctCount + 1 : correctCount,
      wrongCount: isCorrect ? wrongCount : wrongCount + 1,
      score: (isCorrect ? correctCount + 1 : correctCount) * 5,
      combo: newCombo,
      maxCombo: newMaxCombo,
      answeredProblems: [...answeredProblems, newResult],
    });

    // Play correct/wrong sound is handled in the component calling submitAnswer

    setTimeout(() => {
      const nextIdx = get().currentQuestionIndex + 1;
      if (nextIdx >= 20) {
        const startT = get().startTime;
        const elapsed = startT ? Math.round((Date.now() - startT) / 1000) : 0;
        setBestScore(get().score);
        set({
          screen: 'result',
          status: 'result',
          isShowingFeedback: false,
          feedbackResult: null,
          elapsedSeconds: elapsed,
        });
      } else {
        set({
          currentQuestionIndex: nextIdx,
          userHour: '',
          userMinute: '',
          userSecond: '',
          activeField: 'hour',
          isShowingFeedback: false,
          feedbackResult: null,
        });
      }
    }, 1000);
  },

  goToResult: () => set({ screen: 'result', status: 'result' }),

  resetGame: () => {
    const timer = get().autoSubmitTimer;
    if (timer) clearTimeout(timer);

    set({
      status: 'ready',
      currentQuestionIndex: 0,
      questions: [],
      correctCount: 0,
      wrongCount: 0,
      missedCount: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      userHour: '',
      userMinute: '',
      userSecond: '',
      activeField: 'hour',
      isShowingFeedback: false,
      feedbackResult: null,
      answeredProblems: [],
      autoSubmitTimer: null,
      startTime: null,
      elapsedSeconds: 0,
    });
  },
}));
