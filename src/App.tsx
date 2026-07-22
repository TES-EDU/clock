import { useGameStore } from './stores/gameStore'
import { useOrientation } from './hooks/useOrientation'
import PortraitWarning from './components/screens/PortraitWarning'
import StartScreen from './components/screens/StartScreen'
import CurriculumSelectScreen from './components/screens/CurriculumSelectScreen'
import GameScreen from './components/screens/GameScreen'
import ResultScreen from './components/screens/ResultScreen'
import SettingsScreen from './components/screens/SettingsScreen'
import SharedMathReport from './components/screens/SharedMathReport'

import { useState } from 'react'
import MathAdminPage from './components/screens/admin/MathAdminPage'
import MathStudentHistoryScreen from './components/screens/admin/MathStudentHistoryScreen'

function App() {
  const screen = useGameStore((s) => s.screen)
  const { isPortrait } = useOrientation()
  const [adminStudent, setAdminStudent] = useState<string | null>(null)

  // URL 파라미터 확인
  const params = new URLSearchParams(window.location.search)
  const reportId = params.get('report')
  const isAdmin = params.get('admin') === 'true'

  if (isAdmin) {
    if (adminStudent) {
      return (
        <MathStudentHistoryScreen
          studentName={adminStudent}
          onBack={() => setAdminStudent(null)}
          onReportClick={(id) => {
            window.location.href = `${window.location.pathname}?report=${id}`;
          }}
        />
      );
    }
    return <MathAdminPage onStudentClick={(name) => setAdminStudent(name)} />;
  }

  if (reportId) {
    return <SharedMathReport reportId={reportId} />
  }

  if (isPortrait) {
    return <PortraitWarning />
  }

  return (
    <div className="w-full h-full">
      {screen === 'start' && <StartScreen />}
      {screen === 'curriculumSelect' && <CurriculumSelectScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'result' && <ResultScreen />}
      {screen === 'settings' && <SettingsScreen />}
    </div>
  )
}

export default App

