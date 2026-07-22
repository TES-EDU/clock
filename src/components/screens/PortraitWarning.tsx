import React from 'react';
import { FONT_FAMILY } from '../../constants';

const PortraitWarning: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      style={{ fontFamily: FONT_FAMILY }}
    >
      {/* Rotation icon */}
      <div className="text-7xl mb-6 animate-pulse">
        📱
      </div>
      <div className="text-5xl mb-8 animate-spin" style={{ animationDuration: '3s' }}>
        🔄
      </div>

      {/* Title */}
      <h1 className="text-3xl text-gray-800 font-bold mb-4 text-center px-6">
        화면을 가로로 돌려주세요
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-500 text-center px-8">
        이 게임은 가로 모드에서만 플레이할 수 있습니다
      </p>

      {/* Teacher page shortcut */}
      <button
        onClick={() => { window.location.href = '?admin=true'; }}
        className="mt-10 text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
        style={{ fontFamily: FONT_FAMILY }}
      >
        선생님 페이지 가기
      </button>
    </div>
  );
};

export default PortraitWarning;
