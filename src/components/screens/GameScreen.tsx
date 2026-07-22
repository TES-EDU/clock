import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import ClockFace from '../clock/ClockFace';
import InputPanel from '../input/InputPanel';
import { useSound } from '../../hooks/useSound';
import { FONT_FAMILY, COLORS } from '../../constants';

const GameScreen: React.FC = () => {
  const status = useGameStore((s) => s.status);
  const levelId = useGameStore((s) => s.levelId);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetGame = useGameStore((s) => s.resetGame);
  const resumeGame = useGameStore((s) => s.resumeGame);

  const currentQuestionIndex = useGameStore((s) => s.currentQuestionIndex);
  const questions = useGameStore((s) => s.questions);
  const isShowingFeedback = useGameStore((s) => s.isShowingFeedback);
  const feedbackResult = useGameStore((s) => s.feedbackResult);

  const { playPause, playCorrect, playWrong } = useSound();

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Play sound on feedback change
  useEffect(() => {
    if (feedbackResult === 'correct') {
      playCorrect();
    } else if (feedbackResult === 'wrong') {
      playWrong();
    }
  }, [feedbackResult, playCorrect, playWrong]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length || 20;

  const handleResume = () => {
    playPause();
    resumeGame();
  };

  const handleExitClick = () => {
    playPause();
    setShowExitConfirm(true);
  };

  const handleConfirmExit = (confirm: boolean) => {
    playPause();
    setShowExitConfirm(false);
    if (confirm) {
      resetGame();
      setScreen('curriculumSelect');
    }
  };

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-cream">
        <span className="text-2xl font-bold text-text-brown">시작하는 중...</span>
      </div>
    );
  }

  const showSecondHand = parseInt(levelId, 10) >= 7;

  // Format the correct answer for overlay display
  const getCorrectAnswerText = () => {
    const lvl = parseInt(levelId, 10);
    if (lvl === 1) {
      return `${currentQuestion.h}시`;
    } else if (lvl <= 6) {
      return `${currentQuestion.h}시 ${currentQuestion.m}분`;
    } else {
      return `${currentQuestion.h}시 ${currentQuestion.m}분 ${currentQuestion.s}초`;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-row" style={{ fontFamily: FONT_FAMILY, backgroundColor: COLORS.cream }}>
      {/* Left: Clock Area */}
      <div className="w-[55%] h-full flex flex-col p-4 border-r" style={{ borderColor: COLORS.border }}>
        {/* Progress header */}
        <div className="flex items-center justify-between w-full mb-3 shrink-0">
          <button
            onClick={handleExitClick}
            aria-label="나가기"
            className="px-4 py-2 rounded-xl text-lg font-bold shadow-sm transition-all duration-150 active:scale-95 bg-white border"
            style={{ color: COLORS.yaleBlue, borderColor: COLORS.border }}
          >
            나가기
          </button>
          
          {/* Progress bar */}
          <div className="flex-1 mx-4 h-3.5 rounded-full overflow-hidden relative" style={{ backgroundColor: 'rgba(190, 233, 232, 0.3)', border: `1px solid ${COLORS.border}` }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                backgroundColor: COLORS.pacificBlue,
              }}
            />
          </div>

          <span className="text-lg font-bold shrink-0" style={{ color: COLORS.yaleBlue }}>
            {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* SVG Clock Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            style={{
              width: 'min(72vh, 52vw)',
              height: 'min(72vh, 52vw)',
            }}
          >
            <ClockFace
              hour={currentQuestion.h}
              minute={currentQuestion.m}
              second={currentQuestion.s}
              showSecondHand={showSecondHand}
            />

            {/* O/X Feedback Overlay */}
            {isShowingFeedback && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-full z-20 pointer-events-none">
                {feedbackResult === 'correct' ? (
                  <svg className="w-40 h-40 animate-pop-in" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" stroke="#43A047" strokeWidth="9" fill="none" />
                  </svg>
                ) : (
                  <svg className="w-40 h-40 animate-pop-in" viewBox="0 0 100 100">
                    <path d="M22,22 L78,78 M78,22 L22,78" stroke="#E53935" strokeWidth="9" strokeLinecap="round" fill="none" />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* Correct Answer Display on wrong */}
          {isShowingFeedback && feedbackResult === 'wrong' && (
            <div className="absolute bottom-4 left-0 right-0 text-center z-10 animate-slide-up">
              <span
                className="inline-block text-2xl md:text-3xl font-black bg-rose-50 border border-rose-200 text-rose-600 px-6 py-2.5 rounded-2xl shadow-md"
              >
                정답: {getCorrectAnswerText()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Input Panel */}
      <div className="w-[45%] h-full">
        <InputPanel />
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-xl font-bold" style={{ color: COLORS.yaleBlue }}>
              연습을 중단하고 나가시겠습니까?
            </h3>
            <p className="text-sm text-gray-500">
              지금까지의 진행 내역은 저장되지 않습니다.
            </p>
            <div className="flex flex-row gap-3 w-full mt-2">
              <button
                onClick={() => handleConfirmExit(false)}
                className="flex-1 py-3.5 rounded-xl text-lg font-bold shadow-md transition-all active:scale-95 bg-white border"
                style={{ color: COLORS.yaleBlue, borderColor: COLORS.border }}
              >
                취소
              </button>
              <button
                onClick={() => handleConfirmExit(true)}
                className="flex-1 py-3.5 rounded-xl text-lg font-bold text-white shadow-md transition-all active:scale-95 bg-red-500 hover:bg-red-600"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay (Unused but kept for structure) */}
      {status === 'paused' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">⏸️</span>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.yaleBlue }}>
              일시정지
            </h2>
            <div className="flex flex-row gap-3 w-full mt-4">
              <button
                onClick={() => handleConfirmExit(true)}
                className="flex-1 py-3.5 rounded-xl text-lg font-bold shadow-md transition-all active:scale-95 bg-white border"
                style={{ color: COLORS.yaleBlue, borderColor: COLORS.border }}
              >
                끝내기
              </button>
              <button
                onClick={handleResume}
                className="flex-[2] py-3.5 rounded-xl text-lg font-bold text-white shadow-md transition-all active:scale-95"
                style={{ backgroundColor: COLORS.pacificBlue }}
              >
                계속하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
