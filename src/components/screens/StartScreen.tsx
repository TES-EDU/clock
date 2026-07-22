import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import {
  setStudentName as saveStudentName,
  setCurrentStudent,
  getLastBranch,
  setLastBranch,
  type StudentSession,
} from '../../utils/storage';
import {
  addStudentToClass,
  createStudentProfile,
  getClasses,
  getStudents,
  setCurrentAcademy,
  type StudentRow,
} from '../../lib/supabase';
import { FONT_FAMILY, COLORS } from '../../constants';
const PASSWORD = '1234';
// 사용자에게 학원 코드를 입력받지 않고 이 앱의 TES 학원을 명시적으로 사용합니다.
const TES_ACADEMY_ID = '65afbedb-b27b-453c-9fe6-f43815d4fa98';
const BRANCHES = ['하계', '중계', '창동'] as const;
type Branch = typeof BRANCHES[number];

// 동명이인 확인 모달
function DuplicateModal({
  student,
  branch,
  onConfirm,
  onNewProfile,
}: {
  student: StudentRow;
  branch: Branch;
  onConfirm: () => void;
  onNewProfile: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl"
        style={{ fontFamily: FONT_FAMILY }}
      >
        <div className="text-5xl mb-3">👋</div>
        <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.yaleBlue }}>
          {student.name}님,
        </h3>
        <p className="text-sm mb-4" style={{ color: COLORS.textMid }}>
          {branch}반 학생이 맞나요?
        </p>
        <button
          onClick={onConfirm}
          className="w-full py-3.5 mb-3 text-white font-bold rounded-xl shadow-md transition-all hover:brightness-110 active:scale-95"
          style={{ backgroundColor: COLORS.btnSubmit, color: COLORS.yaleBlue }}
        >
          네, 시작하기 🎮
        </button>
        <button
          onClick={onNewProfile}
          className="w-full py-3.5 rounded-xl font-medium transition-all hover:bg-gray-100 active:scale-95"
          style={{ backgroundColor: COLORS.paleSky, color: COLORS.textMid }}
        >
          아니요, 동명이인입니다
        </button>
      </div>
    </div>
  );
}

function NewStudentModal({
  name,
  branch,
  onConfirm,
  onCancel,
}: {
  name: string;
  branch: Branch;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl" style={{ fontFamily: FONT_FAMILY }}>
        <div className="text-5xl mb-3">📝</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.yaleBlue }}>
          등록된 학생이 아닙니다
        </h3>
        <p className="text-sm mb-5" style={{ color: COLORS.textMid }}>
          {branch}반에 <strong>{name}</strong> 학생을<br />신규 생성할까요?
        </p>
        <button
          onClick={onConfirm}
          className="w-full py-3.5 mb-3 text-white font-bold rounded-xl shadow-md transition-all hover:brightness-110 active:scale-95"
          style={{ backgroundColor: COLORS.btnSubmit, color: COLORS.yaleBlue }}
        >
          네, 신규 생성
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3.5 rounded-xl font-medium transition-all hover:bg-gray-100 active:scale-95"
          style={{ backgroundColor: COLORS.paleSky, color: COLORS.textMid }}
        >
          아니요, 다시 입력
        </button>
      </div>
    </div>
  );
}

const StartScreen: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);

  const [name, setName] = useState('');
  const [branch, setBranch] = useState<Branch | ''>('');
  const [password, setPassword] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicateStudent, setDuplicateStudent] = useState<StudentRow | null>(null);
  const [confirmNewStudent, setConfirmNewStudent] = useState(false);

  const canFullscreen = !!document.documentElement.requestFullscreen;

  useEffect(() => {
    // 마지막 선택 지점 복원
    const lastBranch = getLastBranch() as Branch | '';
    if (lastBranch && (BRANCHES as readonly string[]).includes(lastBranch)) {
      setBranch(lastBranch);
    }
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (e) { console.error(e); }
  }, []);

  const getBranchContext = async () => {
    const [classes, students] = await Promise.all([getClasses(), getStudents()]);
    const matchedClass = classes.find(c => c.name.includes(branch));
    const classStudentIds = new Set(matchedClass?.student_ids ?? []);
    const classStudents = students.filter(student => classStudentIds.has(student.id));

    return { matchedClass, classStudents };
  };

  // 클래스 조회 및 학생 찾기/생성 후 게임 진입
  const loginAndStart = async (existingStudent?: StudentRow, forceNew = false) => {
    setSubmitting(true);
    setError('');
    try {
      const { matchedClass, classStudents } = await getBranchContext();

      let student: StudentRow;

      if (existingStudent) {
        // 사용자가 확인한, 해당 반에 명시적으로 등록된 학생만 사용합니다.
        student = existingStudent;
      } else {
        const found = !forceNew
          ? classStudents.find(candidate => candidate.name === name.trim())
          : undefined;
        if (found) {
          setDuplicateStudent(found);
          setSubmitting(false);
          return;
        }

        if (!forceNew) {
          setConfirmNewStudent(true);
          setSubmitting(false);
          return;
        }

        if (!matchedClass) {
          throw new Error(`선택한 반(${branch})을 찾지 못했습니다.`);
        }

        const createdStudent = await createStudentProfile(name.trim(), TES_ACADEMY_ID);
        if (!createdStudent) {
          throw new Error('학생 정보를 생성하지 못했습니다.');
        }

        const added = await addStudentToClass(matchedClass.id, createdStudent.id);
        if (!added) {
          throw new Error('학생을 선택한 반에 연결하지 못했습니다.');
        }
        student = createdStudent;
      }

      if (student.academy_id) {
        setCurrentAcademy({ id: student.academy_id, name: 'TES', code: 'TES' });
      }

      // 5. 세션 저장
      const session: StudentSession = {
        id: student.id,
        name: student.name,
        branch: branch as Branch,
        academy_id: student.academy_id ?? null,
        class_id: matchedClass?.id ?? null,
      };
      setCurrentStudent(session);
      saveStudentName(student.name);
      setLastBranch(branch as Branch);

      // 6. 게임 시작
      setScreen('curriculumSelect');
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async () => {
    setError('');
    if (!name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!branch) { setError('반을 선택해주세요.'); return; }
    if (password !== PASSWORD) { setError('비밀번호가 올바르지 않습니다.'); return; }
    await loginAndStart();
  };

  const handleConfirmExisting = async () => {
    setDuplicateStudent(null);
    if (duplicateStudent) await loginAndStart(duplicateStudent);
  };

  const handleNewProfile = async () => {
    setDuplicateStudent(null);
    // 이름 중복이어도 새 프로필로 강제 생성
    await loginAndStart(undefined, true);
  };

  const handleConfirmNewStudent = async () => {
    setConfirmNewStudent(false);
    await loginAndStart(undefined, true);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-auto"
      style={{
        fontFamily: FONT_FAMILY,
        background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.frozenWater} 40%, ${COLORS.paleSky} 70%, ${COLORS.pacificBlue} 100%)`,
      }}
    >
      {/* 동명이인 확인 모달 */}
      {duplicateStudent && branch && (
        <DuplicateModal
          student={duplicateStudent}
          branch={branch as Branch}
          onConfirm={handleConfirmExisting}
          onNewProfile={handleNewProfile}
        />
      )}
      {confirmNewStudent && branch && (
        <NewStudentModal
          name={name.trim()}
          branch={branch}
          onConfirm={handleConfirmNewStudent}
          onCancel={() => setConfirmNewStudent(false)}
        />
      )}

      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 md:gap-3 z-10">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="h-9 md:h-10 px-3 md:px-4 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center gap-1.5 md:gap-2 transition-all hover:bg-white/90 hover:shadow-md hover:scale-105 active:scale-95"
          style={{ color: COLORS.yaleBlue }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="text-xs md:text-sm font-bold tracking-tight">{soundEnabled ? '효과음 ON' : '효과음 OFF'}</span>
        </button>
        {canFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="h-9 md:h-10 px-3 md:px-4 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center gap-1.5 md:gap-2 transition-all hover:bg-white/90 hover:shadow-md hover:scale-105 active:scale-95"
            style={{ color: COLORS.yaleBlue }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            <span className="text-xs md:text-sm font-bold tracking-tight">전체화면</span>
          </button>
        )}
      </div>

      {/* Title */}
      <h1
        className="start-title text-5xl md:text-6xl lg:text-7xl font-bold mb-8 md:mb-12 text-center"
        style={{
          color: COLORS.yaleBlue,
          textShadow: `3px 3px 6px rgba(0,0,0,0.06), 0 0 30px ${COLORS.pacificBlue}4D`,
        }}
      >
        ⏰ CLOCK TEST
      </h1>

      {/* Login Form */}
      <div className="start-form flex flex-col items-center gap-3 w-72">
        {/* 이름 */}
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="이름"
          disabled={submitting}
          className="start-input w-full text-center py-3 px-4 rounded-xl text-xl shadow-md border-2 outline-none bg-white/90 transition-colors disabled:opacity-60"
          style={{ color: COLORS.yaleBlue, borderColor: COLORS.paleSky }}
        />

        {/* 반 선택 드롭다운 */}
        <select
          value={branch}
          onChange={(e) => { setBranch(e.target.value as Branch | ''); setError(''); }}
          disabled={submitting}
          className="start-input w-full text-center py-3 px-4 rounded-xl text-xl shadow-md border-2 border-amber-200 outline-none focus:border-amber-400 bg-white/90 transition-colors disabled:opacity-60 cursor-pointer"
          style={{ color: COLORS.yaleBlue, borderColor: COLORS.border, backgroundColor: `rgba(200,215,243,0.15)` }}
        >
          <option value="" disabled>반 선택</option>
          {BRANCHES.map(b => (
            <option key={b} value={b}>{b}반</option>
          ))}
        </select>

        {/* 비밀번호 */}
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="비밀번호"
          disabled={submitting}
          className="start-input w-full text-center py-3 px-4 rounded-xl text-xl shadow-md border-2 outline-none bg-white/90 transition-colors disabled:opacity-60"
          style={{ color: COLORS.yaleBlue, borderColor: COLORS.border }}
        />

        {/* 에러 메시지 */}
        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          disabled={submitting}
          className="start-btn w-full py-4 px-8 rounded-2xl text-2xl font-bold text-white shadow-lg
                     transition-all duration-150 active:scale-95 hover:shadow-xl hover:brightness-110 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: COLORS.pacificBlue }}
        >
          {submitting ? '확인 중...' : '🎮 게임 시작'}
        </button>
      </div>

      {/* Teacher page shortcut */}
      <div className="mt-3 md:mt-4">
        <button
          onClick={() => { window.location.href = '?admin=true'; }}
          className="text-xs md:text-sm font-medium transition-colors hover:text-bronze"
          style={{ color: COLORS.textMid, textDecoration: 'underline' }}
        >
          선생님 페이지 가기
        </button>
      </div>

      {/* Developer Credit */}
      <div
        className="fixed bottom-3 left-4 pointer-events-none select-none"
        style={{ fontFamily: FONT_FAMILY }}
      >
        <p className="text-xs leading-snug" style={{ color: 'rgba(27,73,101,0.35)' }}>
          © 2026 TES-EDU
        </p>
        <p className="text-xs leading-snug" style={{ color: 'rgba(27,73,101,0.35)' }}>
          Developed by Seojin Lee
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
