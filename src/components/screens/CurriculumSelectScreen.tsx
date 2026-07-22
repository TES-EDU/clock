import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getLevelDisplayName } from '../../game/clockProblemGenerator';
import { FONT_FAMILY, COLORS } from '../../constants';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

// Mini clock emoji/icon per level for visual differentiation
const LEVEL_ICONS = ['🕐', '🕧', '🕒', '🕥', '🕔', '🕠', '🕖', '🕗'];

const CurriculumSelectScreen: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const setLevelId = useGameStore((s) => s.setLevelId);
  const startGame = useGameStore((s) => s.startGame);

  const handleLevelSelect = (level: number) => {
    setLevelId(String(level));
    startGame();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        fontFamily: FONT_FAMILY,
        background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.frozenWater} 100%)`,
      }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shadow-sm shrink-0"
        style={{
          backgroundColor: 'rgba(190, 233, 232, 0.3)',
          backdropFilter: 'blur(8px)',
          borderBottom: `2px solid ${COLORS.border}`,
        }}
      >
        <button
          onClick={() => setScreen('start')}
          aria-label="뒤로 가기"
          className="text-2xl px-3 py-1 rounded-xl hover:bg-white/60 active:scale-95 transition-all font-bold"
          style={{ color: COLORS.yaleBlue }}
        >
          ←
        </button>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.yaleBlue }}>
          난이도 선택
        </h1>
        <button
          onClick={() => setScreen('settings')}
          aria-label="설정"
          className="text-2xl px-3 py-1 rounded-xl hover:bg-white/60 active:scale-95 transition-all"
          style={{ color: COLORS.yaleBlue }}
        >
          ⚙️
        </button>
      </div>

      {/* Grid container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl mx-auto w-full flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelSelect(lvl)}
              aria-label={`${lvl}단계: ${getLevelDisplayName(lvl)}`}
              className="flex flex-col items-center justify-center bg-white rounded-3xl border-2 shadow-sm transition-all duration-150 active:scale-95 hover:scale-[1.02] hover:shadow-md p-5"
              style={{
                minHeight: '120px',
                borderColor: COLORS.border,
              }}
            >
              <span className="text-2xl mb-1">{LEVEL_ICONS[lvl - 1]}</span>
              <span
                className="text-4xl md:text-5xl font-black mb-2"
                style={{ color: COLORS.pacificBlue }}
              >
                {lvl}
              </span>
              <span
                className="font-bold text-sm md:text-base leading-tight text-center"
                style={{ color: COLORS.yaleBlue }}
              >
                {getLevelDisplayName(lvl)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div
        className="px-4 py-4 text-center shrink-0 border-t"
        style={{ backgroundColor: 'rgba(190, 233, 232, 0.15)', borderColor: COLORS.border }}
      >
        <p className="text-sm font-medium" style={{ color: COLORS.textMid }}>
          원하는 난이도를 선택하면 바로 연습이 시작됩니다! ⏱️
        </p>
      </div>
    </div>
  );
};

export default CurriculumSelectScreen;
