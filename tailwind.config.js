/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        game: ["'OwnglyphParkDaHyun'", 'sans-serif'],
      },
      colors: {
        // Beach Sunset palette (per handout.md spec)
        'frozen-water': '#BEE9E8',    // 배경, 카드
        'pacific-blue': '#62B6CB',    // 주요 버튼, 강조
        'yale-blue': '#1B4965',       // 텍스트, 제목, 시계 테두리
        'pale-sky': '#CAE9FF',        // 보조 배경, 입력 필드
        'fresh-sky': '#5FA8D3',       // 호버, 중간 강조

        // Derived utility aliases
        cream: '#FFFEEA',             // 메인 배경 (부드러운 크림)
        'cream-dark': '#E8F6F6',      // hover 배경
        'card-bg': '#FFFFFF',         // 카드 배경
        'text-brown': '#1B4965',      // = yale-blue (텍스트)
        'text-mid': '#3E7A97',        // 중간 톤 텍스트
        'border-sage': '#BEE9E8',     // = frozen-water (보더)

        // Feedback colors
        'correct-green': '#43A047',
        'correct-pale': '#E8F5E9',
        'wrong-red': '#E53935',
        'wrong-pale': '#FFEBEE',

        // Clock hand colors (per spec)
        'clock-hour': '#E53935',      // 시침 빨강
        'clock-minute': '#1E88E5',    // 분침 파랑
        'clock-second': '#43A047',    // 초침 녹색

        // Button
        'btn-primary': '#62B6CB',     // = pacific-blue
        'btn-primary-hover': '#5FA8D3', // = fresh-sky
        'btn-submit': '#FFE08B',      // 제출 버튼 (밝은 옐로우)
      },
      animation: {
        'pop-in': 'popIn 0.2s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 1s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { textShadow: '0 0 5px rgba(98, 182, 203, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(98, 182, 203, 0.8), 0 0 30px rgba(98, 182, 203, 0.4)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
