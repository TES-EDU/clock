import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useSound } from '../../hooks/useSound';
import { FONT_FAMILY, COLORS } from '../../constants';

const Keypad: React.FC = () => {
  const appendDigit = useGameStore((s) => s.appendDigit);
  const deleteDigit = useGameStore((s) => s.deleteDigit);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  
  const { playClick } = useSound();

  const handleNumberPress = (digit: string) => {
    playClick();
    appendDigit(digit);
  };

  const handleDelete = () => {
    playClick();
    deleteDigit();
  };

  const handleSubmit = () => {
    playClick();
    submitAnswer();
  };

  const numberButton = (digit: string) => (
    <button
      key={digit}
      onClick={() => handleNumberPress(digit)}
      aria-label={`숫자 ${digit}`}
      className="flex items-center justify-center shadow-sm active:bg-gray-100
                 transition-all duration-100 active:scale-95 hover:shadow-md select-none"
      style={{
        fontFamily: FONT_FAMILY,
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        border: `1.5px solid ${COLORS.border}`,
        color: COLORS.yaleBlue,
        fontSize: 'clamp(1.5rem, 3vw, 3rem)',
        fontWeight: 'bold',
        minHeight: '3rem',
      }}
    >
      {digit}
    </button>
  );

  const actionButton = (label: string, onClick: () => void, isSubmit = false) => (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center shadow-sm
                 transition-all duration-100 active:scale-95 active:brightness-95
                 hover:shadow-md select-none"
      style={{
        fontFamily: FONT_FAMILY,
        backgroundColor: isSubmit ? COLORS.btnSubmit : COLORS.paleSky,
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: '32px',
        color: COLORS.yaleBlue,
        fontSize: 'clamp(1.1rem, 2.5vw, 2rem)',
        fontWeight: 'bold',
        minHeight: '3rem',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full p-3 md:p-4 flex flex-col">
      <div className="grid grid-cols-3 gap-2 md:gap-3 flex-1">
        {/* Row 1: 7 8 9 */}
        {numberButton('7')}
        {numberButton('8')}
        {numberButton('9')}

        {/* Row 2: 4 5 6 */}
        {numberButton('4')}
        {numberButton('5')}
        {numberButton('6')}

        {/* Row 3: 1 2 3 */}
        {numberButton('1')}
        {numberButton('2')}
        {numberButton('3')}

        {/* Row 4: 지우기 0 입력 */}
        {actionButton('지우기', handleDelete)}
        {numberButton('0')}
        {actionButton('입력', handleSubmit, true)}
      </div>
    </div>
  );
};

export default Keypad;
