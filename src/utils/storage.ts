import type { SoundSettings } from '../game/types';

const STORAGE_KEYS = {
  BEST_SCORE: 'clocktest_bestScore',
  BEST_COMBO: 'clocktest_bestCombo',
  RECENT_RESULTS: 'clocktest_recentResults',
  SOUND_SETTINGS: 'clocktest_soundSettings',
  SELECTED_MODE: 'clocktest_selectedMode',
  SELECTED_LEVEL: 'clocktest_selectedLevel',
  STUDENT_NAME: 'clocktest_studentName',
  LAST_BRANCH: 'clocktest_lastBranch',
} as const;

// ============================================
// 현재 로그인 학생 (sessionStorage — 탭 닫으면 초기화)
// ============================================

export interface StudentSession {
  id: string;
  name: string;
  branch: string;       // '하계' | '중계' | '창동'
  academy_id: string | null;
  class_id: string | null;
}

export function setCurrentStudent(student: StudentSession): void {
  sessionStorage.setItem('clocktest_currentStudent', JSON.stringify(student));
}

export function getCurrentStudent(): StudentSession | null {
  const stored = sessionStorage.getItem('clocktest_currentStudent');
  return stored ? JSON.parse(stored) : null;
}

export function getCurrentStudentId(): string | null {
  return getCurrentStudent()?.id ?? null;
}

export function getCurrentAcademyIdFromSession(): string | null {
  return getCurrentStudent()?.academy_id ?? null;
}

export function clearCurrentStudent(): void {
  sessionStorage.removeItem('clocktest_currentStudent');
}

export function getStudentName(): string {
  return localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || '';
}

export function setStudentName(name: string): void {
  localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, name.trim());
}

// 마지막 선택 지점 기억 (편의성)
export function setLastBranch(branch: string): void {
  localStorage.setItem(STORAGE_KEYS.LAST_BRANCH, branch);
}

export function getLastBranch(): string {
  return localStorage.getItem(STORAGE_KEYS.LAST_BRANCH) || '';
}

export function getBestScore(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || '0', 10);
}

export function setBestScore(score: number): void {
  const current = getBestScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(score));
  }
}

export function getBestCombo(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.BEST_COMBO) || '0', 10);
}

export function setBestCombo(combo: number): void {
  const current = getBestCombo();
  if (combo > current) {
    localStorage.setItem(STORAGE_KEYS.BEST_COMBO, String(combo));
  }
}

export function getSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOUND_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { enabled: true, volume: 0.7 };
}

export function setSoundSettings(settings: SoundSettings): void {
  localStorage.setItem(STORAGE_KEYS.SOUND_SETTINGS, JSON.stringify(settings));
}

export function getSelectedMode(): string {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_MODE) || 'add_sub';
}

export function setSelectedMode(modeId: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_MODE, modeId);
}

export function getSelectedLevel(): string {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_LEVEL) || 'ADD_01';
}

export function setSelectedLevel(levelId: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_LEVEL, levelId);
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
