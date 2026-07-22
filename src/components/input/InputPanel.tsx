import React from 'react';
import CurrentInput from './CurrentInput';
import Keypad from './Keypad';
import { FONT_FAMILY, COLORS } from '../../constants';

const InputPanel: React.FC = () => {
  return (
    <div
      className="flex flex-col h-full relative"
      style={{
        fontFamily: FONT_FAMILY,
        backgroundColor: COLORS.cream,
      }}
    >
      {/* Current input area - 35% */}
      <div className="flex-[3.5] min-h-0 border-b" style={{ borderColor: COLORS.border }}>
        <CurrentInput />
      </div>

      {/* Keypad area - 65% */}
      <div className="flex-[6.5] min-h-0">
        <Keypad />
      </div>
    </div>
  );
};

export default InputPanel;
