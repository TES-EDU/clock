import React, { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { clearAllData } from '../../utils/storage';
import { FONT_FAMILY, COLORS } from '../../constants';

const SettingsScreen: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const setSoundVolume = useGameStore((s) => s.setSoundVolume);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (_) { /* ignore */ }
  }, []);

  const handleClearData = () => {
    clearAllData();
    setShowConfirm(false);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center overflow-y-auto"
      style={{
        fontFamily: FONT_FAMILY,
        background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.frozenWater} 100%)`,
      }}
    >
      {/* Header */}
      <div className="w-full flex items-center px-6 pt-6 pb-4 shrink-0">
        <button
          onClick={() => setScreen('curriculumSelect')}
          className="text-2xl px-4 py-2 rounded-xl transition-all duration-150 active:scale-95
                     hover:bg-white/60 font-bold"
          style={{ color: COLORS.yaleBlue }}
        >
          ← 뒤로
        </button>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-6" style={{ color: COLORS.yaleBlue }}>
        ⚙️ 설정
      </h1>

      <div className="rounded-3xl shadow-lg px-8 py-8 max-w-md w-[90%] bg-white border" style={{ borderColor: COLORS.border }}>
        {/* Sound toggle */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-bold" style={{ color: COLORS.yaleBlue }}>
            🔊 효과음
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
              soundEnabled ? '' : 'bg-gray-300'
            }`}
            style={soundEnabled ? { backgroundColor: COLORS.pacificBlue } : {}}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                soundEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Volume slider (only when sound enabled) */}
        {soundEnabled && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg" style={{ color: COLORS.textMid }}>
                볼륨
              </span>
              <span className="text-lg font-bold" style={{ color: COLORS.pacificBlue }}>
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200"
              style={{
                background: `linear-gradient(to right, ${COLORS.pacificBlue} 0%, ${COLORS.pacificBlue} ${soundVolume * 100}%, #E2E8F0 ${soundVolume * 100}%, #E2E8F0 100%)`,
              }}
            />
          </div>
        )}

        <div className="border-t border-gray-100 my-6" />

        {/* Fullscreen toggle */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-bold" style={{ color: COLORS.yaleBlue }}>
            📱 전체화면
          </span>
          <button
            onClick={toggleFullscreen}
            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
              isFullscreen ? '' : 'bg-gray-300'
            }`}
            style={isFullscreen ? { backgroundColor: COLORS.pacificBlue } : {}}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                isFullscreen ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs mb-6" style={{ color: '#9E9E9E' }}>
          태블릿에서 크롬 탭을 숨기고 전체 화면으로 플레이합니다.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Clear data */}
        <div>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 rounded-2xl text-lg font-bold transition-all duration-150
                       active:scale-95 hover:bg-red-50"
            style={{
              color: '#F44336',
              border: '2px solid #F44336',
              backgroundColor: 'transparent',
            }}
          >
            🗑️ 데이터 초기화
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl shadow-2xl px-8 py-6 max-w-sm w-[85%] flex flex-col items-center gap-5"
            style={{ fontFamily: FONT_FAMILY }}
          >
            <span className="text-4xl">⚠️</span>
            <h3 className="text-xl font-bold text-center" style={{ color: COLORS.yaleBlue }}>
              정말 모든 데이터를 삭제하시겠습니까?
            </h3>
            <p className="text-sm text-gray-500 text-center">
              저장된 최고 점수, 지점 정보 및 설정 등 모든 데이터가 삭제됩니다.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-2xl text-lg font-bold border border-gray-200
                           transition-all duration-150 active:scale-95 bg-white text-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 py-3 rounded-2xl text-lg font-bold text-white
                           transition-all duration-150 active:scale-95"
                style={{ backgroundColor: '#F44336' }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
