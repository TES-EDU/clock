import React, { useMemo } from 'react';
import { COLORS } from '../../constants';

interface ClockFaceProps {
  hour: number;        // 1~12
  minute: number;      // 0~59
  second: number;      // 0~59
  showSecondHand: boolean;
}

// Generate wavy circle path for bezel (outside component to avoid re-creation)
function generateWavyPath(cx: number, cy: number, r: number, waveCount: number, waveAmp: number): string {
  let path = '';
  for (let i = 0; i <= 360; i++) {
    const angleRad = (i * Math.PI) / 180;
    const modulatedR = r + Math.sin(angleRad * waveCount) * waveAmp;
    const x = cx + modulatedR * Math.cos(angleRad);
    const y = cy + modulatedR * Math.sin(angleRad);
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  path += ' Z';
  return path;
}

// Pre-compute static paths (never change)
const BEZEL_PATH = generateWavyPath(100, 100, 81, 26, 2.2);
const INNER_PATH = generateWavyPath(100, 100, 80.5, 26, 2.2);

const ClockFace: React.FC<ClockFaceProps> = ({
  hour,
  minute,
  second,
  showSecondHand,
}) => {
  // Hand rotation angles
  const normH = hour % 12;
  const hAngle = (normH + minute / 60 + second / 3600) * 30;
  const mAngle = (minute + second / 60) * 6;
  const sAngle = second * 6;

  // Memoized ticks — only recompute if never (static)
  const ticks = useMemo(() => {
    const result = [];
    for (let i = 0; i < 60; i++) {
      const angleRad = (i * 6 * Math.PI) / 180;
      const r = 74;
      const x = 100 + r * Math.sin(angleRad);
      const y = 100 - r * Math.cos(angleRad);
      const isMajor = i % 5 === 0;
      result.push(
        <circle
          key={i}
          cx={x}
          cy={y}
          r={isMajor ? 2.2 : 1.2}
          fill={isMajor ? COLORS.yaleBlue : COLORS.pacificBlue}
        />
      );
    }
    return result;
  }, []);

  // Memoized numbers — static
  const numbers = useMemo(() => {
    const result = [];
    for (let i = 1; i <= 12; i++) {
      const angleRad = (i * 30 * Math.PI) / 180;
      const r = 62;
      const x = 100 + r * Math.sin(angleRad);
      const y = 100 - r * Math.cos(angleRad) + 4.5;
      result.push(
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          fill={COLORS.yaleBlue}
          fontSize="13"
          fontWeight="bold"
          style={{ fontFamily: 'OwnglyphParkDaHyun, sans-serif' }}
        >
          {i}
        </text>
      );
    }
    return result;
  }, []);

  const ariaLabel = `시계: ${hour}시 ${minute}분${showSecondHand ? ` ${second}초` : ''}`;

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={ariaLabel}
        className="w-full h-full drop-shadow-lg select-none overflow-visible"
      >
        {/* SVG Defs for depth/realism */}
        <defs>
          <radialGradient id="clock-face-gradient" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F7F7" />
          </radialGradient>
          <filter id="clock-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={COLORS.yaleBlue} floodOpacity="0.15" />
          </filter>
          <filter
            id="hand-shadow"
            x="20"
            y="20"
            width="160"
            height="160"
            filterUnits="userSpaceOnUse"
          >
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Outer Bezel with gradient and shadow */}
        <path
          d={BEZEL_PATH}
          fill="url(#clock-face-gradient)"
          stroke={COLORS.frozenWater}
          strokeWidth="3.5"
          filter="url(#clock-shadow)"
        />

        {/* Inner Border (Wavy) */}
        <path
          d={INNER_PATH}
          fill="none"
          stroke={COLORS.paleSky}
          strokeWidth="1.5"
        />

        {/* 60 Ticks */}
        <g id="clock-ticks">{ticks}</g>

        {/* 12 Numbers */}
        <g id="clock-numbers">{numbers}</g>

        {/*
          Use filled shapes instead of zero-width SVG lines. Percentage-based
          filter regions on vertical lines have a zero-width bounding box and
          can make the hands disappear in some WebKit/browser renderers.
        */}
        {/* Hour Hand (Red — per spec) */}
        <path
          d="M 96 105 L 96 58 Q 96 54 100 50 Q 104 54 104 58 L 104 105 Z"
          fill={COLORS.clockHour}
          stroke={COLORS.clockHour}
          strokeWidth="1"
          strokeLinejoin="round"
          transform={`rotate(${hAngle}, 100, 100)`}
          filter="url(#hand-shadow)"
        />

        {/* Minute Hand (Blue — per spec) */}
        <path
          d="M 97.25 106 L 97.25 41 Q 97.25 37 100 33 Q 102.75 37 102.75 41 L 102.75 106 Z"
          fill={COLORS.clockMinute}
          stroke={COLORS.clockMinute}
          strokeWidth="0.75"
          strokeLinejoin="round"
          transform={`rotate(${mAngle}, 100, 100)`}
          filter="url(#hand-shadow)"
        />

        {/* Second Hand (Green — per spec) */}
        {showSecondHand && (
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="28"
            stroke={COLORS.clockSecond}
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${sAngle}, 100, 100)`}
            filter="url(#hand-shadow)"
          />
        )}

        {/* Center Cap */}
        <circle
          cx="100"
          cy="100"
          r="5"
          fill={COLORS.pacificBlue}
          stroke={COLORS.yaleBlue}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

export default React.memo(ClockFace);
