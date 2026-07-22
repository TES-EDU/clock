import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { FONT_FAMILY, COLORS } from '../../constants';

const CurrentInput: React.FC = () => {
  const levelId = useGameStore((s) => s.levelId);
  const userHour = useGameStore((s) => s.userHour);
  const userMinute = useGameStore((s) => s.userMinute);
  const userSecond = useGameStore((s) => s.userSecond);
  const activeField = useGameStore((s) => s.activeField);
  const setActiveField = useGameStore((s) => s.setActiveField);

  const lvl = parseInt(levelId, 10);
  const showMinute = lvl >= 2;
  const showSecond = lvl >= 7;

  const renderInputBox = (
    value: string,
    field: 'hour' | 'minute' | 'second',
    label: string
  ) => {
    const isActive = activeField === field;
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setActiveField(field)}
          role="textbox"
          aria-label={`${label} 입력`}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-bold text-3xl md:text-4xl shadow-inner transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: isActive ? COLORS.paleSky : '#FFFFFF',
            border: isActive ? `3px solid ${COLORS.pacificBlue}` : `2px solid ${COLORS.border}`,
            color: COLORS.yaleBlue,
            fontFamily: FONT_FAMILY,
            ...(isActive ? { ringColor: COLORS.pacificBlue } : {}),
          }}
        >
          {value || '?'}
        </button>
        <span className="text-xl md:text-2xl font-bold ml-1" style={{ color: COLORS.yaleBlue }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div
      className="flex items-center justify-center h-full px-4 gap-4 md:gap-6"
      style={{ fontFamily: FONT_FAMILY }}
    >
      {renderInputBox(userHour, 'hour', '시')}
      {showMinute && renderInputBox(userMinute, 'minute', '분')}
      {showSecond && renderInputBox(userSecond, 'second', '초')}
    </div>
  );
};

export default CurrentInput;
