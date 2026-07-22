import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getStudentName } from '../../utils/storage';
import { getCurrentStudent } from '../../utils/storage';
import { saveMathResult } from '../../lib/supabase';
import { getLevelDisplayName } from '../../game/clockProblemGenerator';
import { FONT_FAMILY, COLORS } from '../../constants';
import type { MathCorrectAnswer, MathIncorrectAnswer } from '../../lib/supabase';

const ResultScreen: React.FC = () => {
  const score = useGameStore((s) => s.score);
  const correctCount = useGameStore((s) => s.correctCount);
  const wrongCount = useGameStore((s) => s.wrongCount);
  const missedCount = useGameStore((s) => s.missedCount);
  const maxCombo = useGameStore((s) => s.maxCombo);
  const answeredProblems = useGameStore((s) => s.answeredProblems);
  const levelId = useGameStore((s) => s.levelId);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const resetGame = useGameStore((s) => s.resetGame);
  const startGame = useGameStore((s) => s.startGame);
  const setScreen = useGameStore((s) => s.setScreen);

  const [showWrongList, setShowWrongList] = useState(true);
  const [showCorrectList, setShowCorrectList] = useState(false);
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error'>('saving');
  const savedRef = useRef(false);

  const lvlNum = parseInt(levelId, 10) || 1;
  const unitDisplayName = getLevelDisplayName(lvlNum);
  const chapterTitle = '시계 보기';
  const gradeId = 'G1';

  const totalAll = correctCount + wrongCount;
  const accuracy = totalAll > 0 ? Math.round((correctCount / totalAll) * 100) : 0;

  const wrongItems = answeredProblems
    .filter(p => p.result === 'wrong')
    .map(p => ({
      problemId: p.problemId,
      expression: p.expression,
      correctAnswer: p.correctAnswer,
      userAnswer: p.userAnswer,
      kind: 'wrong' as const,
    }));

  const correctItems = answeredProblems
    .filter(p => p.result === 'correct')
    .map(p => ({
      expression: p.expression,
      answer: p.correctAnswer,
    }));

  // Format encoded time numbers (e.g. 315 -> 3시 15분)
  const formatEncodedTime = (val: number | null) => {
    if (val === null || val === undefined) return '';
    if (lvlNum === 1) {
      return `${val}시`;
    } else if (lvlNum <= 6) {
      const h = Math.floor(val / 100);
      const m = val % 100;
      return `${h}시 ${m}분`;
    } else {
      const h = Math.floor(val / 10000);
      const m = Math.floor((val % 10000) / 100);
      const s = val % 100;
      return `${h}시 ${m}분 ${s}초`;
    }
  };

  const persistResult = async () => {
    setSaveState('saving');
    const ca: MathCorrectAnswer[] = correctItems.map(p => ({ expression: p.expression, answer: p.answer, unitId: levelId }));
    const ia: MathIncorrectAnswer[] = wrongItems.map(p => ({ expression: p.expression, correctAnswer: p.correctAnswer, userAnswer: p.userAnswer, result: p.kind, unitId: levelId }));
    const studentName = getStudentName() || '학생';
    const session = getCurrentStudent();
    try {
      const resultId = await saveMathResult({
        user_name: studentName,
        book_title: 'TES 시계',
        unit_title: `CLOCK_L${levelId}`,
        unit_display_name: `${chapterTitle} — ${unitDisplayName}`,
        grade_id: gradeId,
        total_questions: totalAll,
        correct_count: correctCount,
        wrong_count: wrongCount,
        missed_count: missedCount,
        score,
        accuracy,
        max_combo: maxCombo,
        time_seconds: elapsedSeconds,
        correct_answers: ca,
        incorrect_answers: ia,
        // Local fallback IDs are not UUIDs and cannot be inserted into the
        // math_results.student_id UUID column.
        student_id: session?.id && !session.id.startsWith('local_') ? session.id : null,
        academy_id: session?.academy_id ?? null,
      });
      setSaveState(resultId ? 'saved' : 'error');
    } catch (error) {
      console.error('Unexpected result save failure:', error);
      setSaveState('error');
    }
  };

  // Supabase 자동 저장
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    void persistResult();
  }, []);

  const createdAt = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 overflow-y-auto flex flex-col" style={{ fontFamily: FONT_FAMILY, background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.frozenWater} 100%)` }}>
      {/* ===== 상단 헤더 ===== */}
      <header className="shadow-sm px-4 h-14 flex items-center shrink-0 sticky top-0 z-10" style={{ backgroundColor: `rgba(190, 233, 232, 0.3)`, backdropFilter: 'blur(8px)', borderBottom: `2px solid ${COLORS.border}` }}>
        <h1 className="font-bold truncate text-xl" style={{ color: COLORS.yaleBlue }}>⏰ 시계 보기 성적표</h1>
      </header>

      <div className="p-4 flex-1 pb-8">
        {saveState === 'saving' && (
          <p className="max-w-lg mx-auto mb-3 text-center text-sm" style={{ color: COLORS.textMid }}>
            결과를 저장하는 중입니다...
          </p>
        )}
        {saveState === 'error' && (
          <div className="max-w-lg mx-auto mb-3 text-center text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p>결과 저장에 실패했습니다.</p>
            <button
              type="button"
              onClick={() => void persistResult()}
              className="mt-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              저장 다시 시도
            </button>
          </div>
        )}
        <div className="p-5 rounded-2xl shadow-sm mb-6 max-w-lg mx-auto" style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: `1.5px solid ${COLORS.border}` }}>

          {/* ===== 헤더 ===== */}
          <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: `1.5px solid ${COLORS.border}` }}>
            <div>
              <p className="text-lg font-extrabold" style={{ color: COLORS.pacificBlue }}>TES EDU</p>
              <p className="text-xs" style={{ color: COLORS.textMid }}>시계 마스터</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: COLORS.textMid }}>TES 영어·수학학원</p>
              <p className="text-sm" style={{ color: COLORS.yaleBlue }}>{chapterTitle}</p>
            </div>
          </div>

          {/* ===== 학생 이름 + 단원 ===== */}
          <h2 className="text-lg font-bold mb-1" style={{ color: COLORS.yaleBlue }}>
            {getStudentName() || '학생'}의 시계 보기 성적표
          </h2>
          <p className="text-sm mb-4" style={{ color: COLORS.textMid }}>{unitDisplayName} · {totalAll}문제</p>

          {/* ===== 나의 진도표 ===== */}
          <div className="border border-slate-200 rounded-xl p-4 mb-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">📍</span>
                <span className="font-bold text-sm text-slate-700">나의 진도표</span>
                <span className="text-xs text-slate-400">{unitDisplayName}</span>
              </div>
            </div>
            <div className="mb-1">
              <p className="text-xs font-bold text-slate-500 mb-1.5">진행 레벨: {levelId}단계 / 8단계</p>
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full bg-emerald-400 transition-all duration-300" style={{ width: `${(lvlNum / 8) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* ===== 종합 정답률 카드 ===== */}
          <div className="rounded-xl p-5 mb-4 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${COLORS.pacificBlue} 0%, ${COLORS.freshSky} 100%)` }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>종합 정답률</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">{accuracy}</span>
                <span className="text-2xl font-bold mb-1">%</span>
              </div>
              <p className="text-blue-100 text-sm mt-2">
                총 {totalAll}문제 중 {correctCount}문제 정답 · {Math.floor(elapsedSeconds / 60)}분 {elapsedSeconds % 60}초
              </p>
            </div>
          </div>

          {/* ===== 구분/문제/정답/오답 테이블 ===== */}
          <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
            <div className="bg-emerald-500 p-3 flex items-center gap-2 text-white">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">시계</span>
              <span className="text-sm font-medium">{unitDisplayName}</span>
            </div>
            <div className="p-4 bg-white">
              <div className="rounded-lg border border-slate-100 overflow-hidden text-sm">
                <div className="flex bg-slate-50 border-b border-slate-100">
                  <div className="w-1/4 p-2.5 text-slate-500 font-bold text-center">구분</div>
                  <div className="w-1/4 p-2.5 text-slate-500 font-medium text-center">문제</div>
                  <div className="w-1/4 p-2.5 text-slate-500 font-medium text-center">정답</div>
                  <div className="w-1/4 p-2.5 text-slate-500 font-medium text-center">오답</div>
                </div>
                <div className="flex bg-indigo-50">
                  <div className="w-1/4 p-2.5 text-indigo-700 font-bold text-center">합계</div>
                  <div className="w-1/4 p-2.5 text-center font-bold text-indigo-600">{totalAll}</div>
                  <div className="w-1/4 p-2.5 text-center font-bold text-emerald-600">{correctCount}</div>
                  <div className="w-1/4 p-2.5 text-center font-bold text-red-500">{wrongItems.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 오답 목록 ===== */}
          {wrongItems.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden mb-4 bg-white">
              <button
                onClick={() => setShowWrongList(!showWrongList)}
                className="w-full bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="font-bold text-slate-700 text-sm">오답 목록</span>
                  <span className="text-xs text-red-500">{wrongItems.length}개</span>
                </div>
                <span className="text-slate-400 text-sm">{showWrongList ? '▲' : '▼'}</span>
              </button>
              {showWrongList && (
                <div className="p-4 bg-white space-y-2">
                  {wrongItems.map((w, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm bg-red-50/50 p-3 rounded-lg border border-red-100">
                      <span className="text-red-500 font-bold shrink-0">✗</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-700 truncate text-base">
                          시계 문제 {i + 1}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          내 답: {formatEncodedTime(w.userAnswer) || '없음'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs shrink-0">
                        {w.userAnswer !== null && (
                          <span className="text-red-400 line-through font-bold">{formatEncodedTime(w.userAnswer)}</span>
                        )}
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-600 font-bold text-base">{formatEncodedTime(w.correctAnswer)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== 정답 목록 ===== */}
          {correctItems.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden mb-4 bg-white">
              <button
                onClick={() => setShowCorrectList(!showCorrectList)}
                className="w-full bg-slate-50 p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span>
                  <span className="font-bold text-slate-700 text-sm">정답 목록</span>
                  <span className="text-xs text-emerald-500">{correctItems.length}개</span>
                </div>
                <span className="text-slate-400 text-sm">{showCorrectList ? '▲' : '▼'}</span>
              </button>
              {showCorrectList && (
                <div className="p-4 bg-white">
                  <div className="flex flex-wrap gap-2">
                    {correctItems.map((c, i) => (
                      <span key={i} className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-medium border border-emerald-100">
                        {c.expression}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 다시하기 */}
          <button
            onClick={() => { resetGame(); startGame(); }}
            className="w-full text-white py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 mb-2 transition-all active:scale-95 shadow-md hover:brightness-105"
            style={{ backgroundColor: COLORS.pacificBlue }}
          >
            🔄 다시하기
          </button>

          {/* 홈으로 */}
          <button
            onClick={() => { resetGame(); setScreen('curriculumSelect'); }}
            className="w-full py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 border bg-white"
            style={{ color: COLORS.yaleBlue, borderColor: COLORS.border }}
          >
            🌿 단계 선택으로
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: COLORS.textMid }}>{createdAt}</p>
      </div>
    </div>
  );
};

export default ResultScreen;
