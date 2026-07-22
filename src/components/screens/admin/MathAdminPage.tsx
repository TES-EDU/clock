import { useEffect, useState, useCallback, useMemo } from 'react';
import { Copy, Check, Loader2, RefreshCw, LogOut, ChevronRight, Search, Home } from 'lucide-react';
import { getAllMathResults, getStudents, getClasses, type MathResultRow, type StudentRow, type ClassRow } from '../../../lib/supabase';

interface Props { onStudentClick: (studentName: string) => void; }

type DateFilter = 'all' | 'today' | 'yesterday' | '2daysAgo' | 'custom';

const TEACHER_PASSWORD = '1234';

// 반 설정: 이름, 비밀번호, 색상
const BRANCH_CONFIG = [
  { name: '창동', password: '9012', color: 'from-[#8FA86B] to-[#6E8A50]', bg: 'bg-sb-line-soft', text: 'text-sb-ink', border: 'border-sb-primary', icon: '🏔️' },
  { name: '하계', password: '3456', color: 'from-sage to-sage-dark', bg: 'bg-sb-primary-pale', text: 'text-sb-ink', border: 'border-sb-primary-light', icon: '🌿' },
  { name: '중계', password: '6789', color: 'from-sage-dark to-[#7A9A5A]', bg: 'bg-sb-surface-alt', text: 'text-sb-ink', border: 'border-sb-primary-mid', icon: '🌾' },
] as const;

function fmtDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPage({ onStudentClick }: Props) {
  const [teacherAuthed, setTeacherAuthed] = useState(false);
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const [results, setResults] = useState<MathResultRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // 반 선택 상태
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [unlockedBranch, setUnlockedBranch] = useState<string | null>(null);
  const [branchPassword, setBranchPassword] = useState('');
  const [branchError, setBranchError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [r, s, c] = await Promise.all([getAllMathResults(), getStudents(), getClasses()]);
    setResults(r); setStudents(s); setClasses(c);
    setLoading(false);
  }, []);

  useEffect(() => { if (teacherAuthed) loadAll(); }, [teacherAuthed, loadAll]);

  const handleTeacherLogin = () => {
    if (teacherPassword !== TEACHER_PASSWORD) {
      setTeacherError('선생님 비밀번호가 올바르지 않습니다.');
      return;
    }
    setTeacherError('');
    setTeacherPassword('');
    setTeacherAuthed(true);
  };

  const handleTeacherLogout = () => {
    setTeacherAuthed(false);
    setTeacherPassword('');
    setTeacherError('');
    setSelectedBranch(null);
    setUnlockedBranch(null);
    setBranchPassword('');
    setBranchError('');
    setResults([]);
    setStudents([]);
    setClasses([]);
  };

  const handleCopy = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?report=${id}`);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  // 반 선택 처리
  const handleBranchSelect = (branchName: string) => {
    setSelectedBranch(branchName);
    setUnlockedBranch(null);
    setBranchPassword('');
    setBranchError('');
  };

  const handleBranchLogin = () => {
    const config = BRANCH_CONFIG.find(b => b.name === selectedBranch);
    if (!config) return;
    if (branchPassword !== config.password) {
      setBranchError('비밀번호가 올바르지 않습니다.');
      return;
    }
    setBranchError('');
    setBranchPassword('');
    setUnlockedBranch(selectedBranch);
  };

  const isBranchUnlocked = selectedBranch !== null && selectedBranch === unlockedBranch;

  // 선택한 반에 속한 학생 이름 목록
  const branchStudentNames = useMemo(() => {
    if (!selectedBranch) return new Set<string>();
    const matchedClass = classes.find(c => c.name.includes(selectedBranch));
    if (!matchedClass) return new Set<string>();
    const studentIds = new Set(matchedClass.student_ids || []);
    return new Set(students.filter(s => studentIds.has(s.id)).map(s => s.name));
  }, [selectedBranch, classes, students]);

  // Filtered results (반별 + 날짜 + 검색)
  const filtered = useMemo(() => {
    let data = results;

    // 반 필터
    if (selectedBranch && isBranchUnlocked) {
      data = data.filter(r => branchStudentNames.has(r.user_name));
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      let targetDateStr = '';
      if (dateFilter === 'today') {
        targetDateStr = today.toLocaleDateString('en-CA');
      } else if (dateFilter === 'yesterday') {
        const y = new Date(today); y.setDate(y.getDate() - 1);
        targetDateStr = y.toLocaleDateString('en-CA');
      } else if (dateFilter === '2daysAgo') {
        const d = new Date(today); d.setDate(d.getDate() - 2);
        targetDateStr = d.toLocaleDateString('en-CA');
      } else if (dateFilter === 'custom' && customDate) {
        targetDateStr = customDate;
      }
      if (targetDateStr) {
        data = data.filter(r => {
          if (!r.created_at) return false;
          const localDate = new Date(r.created_at).toLocaleDateString('en-CA');
          return localDate === targetDateStr;
        });
      }
    }

    if (query.trim()) data = data.filter(r => r.user_name.includes(query.trim()));
    return data;
  }, [results, selectedBranch, isBranchUnlocked, branchStudentNames, dateFilter, customDate, query]);


  // ── Teacher Password Login ──
  const TeacherLoginView = () => (
    <div className="min-h-screen bg-sb-bg flex items-center justify-center px-6 font-game">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sb-primary to-sb-primary-dark mb-4 shadow-lg">
            <span className="text-3xl">👨‍🏫</span>
          </div>
          <h1 className="text-3xl font-extrabold text-sb-ink">선생님 로그인</h1>
          <p className="text-lg text-sb-muted mt-1">시계 성적 관리</p>
        </div>

        <div className="bg-sb-surface rounded-2xl shadow-sm border border-sb-line p-6 font-sans">
          <label htmlFor="teacher-password" className="block text-sm font-bold text-sb-ink mb-2">선생님 비밀번호</label>
          <input
            id="teacher-password"
            type="password"
            value={teacherPassword}
            onChange={(e) => { setTeacherPassword(e.target.value); setTeacherError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleTeacherLogin()}
            autoFocus
            placeholder="비밀번호를 입력하세요"
            className="w-full h-12 px-4 rounded-xl border-2 border-sb-line bg-white text-center text-lg font-bold outline-none focus:border-sb-primary transition-colors"
          />
          {teacherError && <p className="text-red-500 text-sm font-medium text-center mt-2">{teacherError}</p>}
          <button
            onClick={handleTeacherLogin}
            className="w-full h-12 mt-4 rounded-xl bg-sb-primary-dark text-white font-bold text-base hover:bg-sb-primary transition-colors"
          >
            로그인
          </button>
        </div>

        <a href={import.meta.env.BASE_URL} className="block text-center text-lg text-sb-muted hover:text-sb-primary-dark mt-6 transition-colors">
          학생 페이지로 돌아가기
        </a>
      </div>
    </div>
  );

  if (!teacherAuthed) return <TeacherLoginView />;

  // ── Header ──
  const Header = () => (
    <header className="bg-sb-surface border-b border-sb-line px-4 md:px-5 h-14 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-[22px] h-[22px] rounded-md bg-gradient-to-br from-sb-primary to-sb-primary-dark flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">T</div>
        <span className="text-sm font-extrabold text-sb-ink truncate md:hidden">TES 시계</span>
        <span className="text-sm font-extrabold text-sb-ink hidden md:inline">TES 시계</span>
        <div className="w-px h-3 bg-sb-line hidden md:block" />
        <span className="text-xs text-sb-muted font-medium hidden md:inline">· 성적 관리</span>
        {selectedBranch && isBranchUnlocked && (
          <>
            <div className="w-px h-3 bg-sb-line" />
            <span className="text-xs font-bold text-sb-primary-dark">{selectedBranch}반</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        {selectedBranch && isBranchUnlocked && (
          <button onClick={() => { setSelectedBranch(null); setUnlockedBranch(null); setBranchPassword(''); }} className="p-2 md:p-0 flex items-center gap-1.5 text-sm text-sb-muted hover:text-sb-primary-dark transition-colors mr-1 md:mr-2">
            <Home size={16} /><span className="hidden md:inline">반 선택으로</span>
          </button>
        )}
        <button onClick={() => window.location.href = window.location.pathname} className="p-2 md:p-0 flex items-center gap-1.5 text-sm text-sb-muted hover:text-sb-primary-dark transition-colors mr-1 md:mr-2">
          <Home size={16} /><span className="hidden md:inline">메인으로</span>
        </button>
        <button onClick={loadAll} className="p-2 md:p-0 flex items-center gap-1.5 text-sm text-sb-muted hover:text-sb-primary-dark transition-colors">
          <RefreshCw size={16} /><span className="hidden md:inline">새로고침</span>
        </button>
        <button onClick={handleTeacherLogout} className="p-2 md:p-0 flex items-center gap-1.5 text-sm text-sb-muted hover:text-sb-wrong-dark transition-colors">
          <LogOut size={16} /><span className="hidden md:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );

  // ── Branch Selection Screen ──
  const BranchSelectView = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-10">
        <div className="text-center mb-6 md:mb-10">
          <div className="text-xs font-extrabold tracking-[0.22em] text-sb-primary-dark mb-2">SELECT BRANCH</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-sb-ink mb-1">반을 선택하세요</h1>
          <p className="text-xs md:text-sm text-sb-muted">반을 선택하고 해당 반 비밀번호로 로그인하세요</p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-5">
          {BRANCH_CONFIG.map(b => (
            <button
              key={b.name}
              onClick={() => handleBranchSelect(b.name)}
              className={`relative rounded-xl md:rounded-2xl border-2 py-3 px-2 md:p-4 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                selectedBranch === b.name ? `${b.border} ${b.bg} shadow-md` : 'border-sb-line bg-sb-surface hover:border-sb-primary-light'
              }`}
            >
              <div className="text-2xl md:text-3xl mb-1">{b.icon}</div>
              <div className={`text-sm md:text-base font-extrabold ${selectedBranch === b.name ? b.text : 'text-sb-ink'}`}>
                {b.name}반
              </div>
              {selectedBranch === b.name && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'rgba(93, 78, 55, 0.4)' }}>
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Password input */}
        {selectedBranch && (
          <div className="mx-auto max-w-sm animate-[fadeIn_0.3s_ease]">
            <div className="flex gap-2">
              <input
                type="password"
                value={branchPassword}
                onChange={(e) => { setBranchPassword(e.target.value); setBranchError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleBranchLogin()}
                placeholder={`${selectedBranch}반 비밀번호`}
                className="flex-1 min-w-0 h-11 px-3 rounded-xl border-2 border-sb-line bg-sb-surface text-center text-base font-bold outline-none focus:border-sb-primary transition-colors"
              />
              <button
                onClick={handleBranchLogin}
                className="h-11 px-5 rounded-xl bg-sb-primary-dark text-white font-bold text-sm shrink-0 hover:bg-sb-primary transition-colors"
              >
                로그인
              </button>
            </div>
            {branchError && <p className="text-red-500 text-sm font-medium text-center mt-2">{branchError}</p>}
          </div>
        )}
      </div>
    </div>
  );

  // ── History View (filtered by branch) ──
  const HistoryView = () => (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <div className="text-xs font-extrabold tracking-[0.22em] text-sb-primary-dark mb-1">HISTORY</div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-sb-ink">{selectedBranch}반 시험 이력</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {(['all', 'today', 'yesterday', '2daysAgo'] as const).map(f => {
          const label = f === 'all' ? '전체' : f === 'today' ? '오늘' : f === 'yesterday' ? '어제' : '그제';
          return (
            <button key={f} onClick={() => { setDateFilter(f); setCustomDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                dateFilter === f ? 'bg-sb-primary-dark text-white' : 'bg-sb-surface text-sb-muted border border-sb-line hover:border-sb-primary-light'
              }`}>{label}</button>
          );
        })}
        
        {/* Custom Date Picker */}
        <div className="relative flex items-center">
          <input 
            type="date"
            value={customDate}
            onChange={(e) => {
              if (e.target.value) {
                setCustomDate(e.target.value);
                setDateFilter('custom');
              } else {
                setCustomDate('');
                setDateFilter('all');
              }
            }}
            className={`h-9 px-3 rounded-lg border text-sm font-semibold transition-colors outline-none cursor-pointer ${
              dateFilter === 'custom' ? 'bg-sb-primary-dark text-white border-sb-primary-dark' : 'bg-sb-surface text-sb-muted border-sb-line hover:border-sb-primary-light'
            }`}
          />
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sb-muted-soft" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="학생 이름 검색…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-sb-line bg-sb-surface text-sm outline-none focus:border-sb-primary" />
        </div>
        <span className="text-sm text-sb-muted self-center">총 {filtered.length}건</span>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-sb-muted" /></div>
      : filtered.length === 0 ? <div className="text-center py-20 text-sb-muted text-sm">결과가 없습니다.</div>
      : (
        <div className="space-y-2">
          {filtered.map(r => {
            const accent = { chip: "bg-sb-primary-pale text-sb-primary-dark" };
            const isCopied = copiedId === r.id;
            return (
              <div key={r.id} onClick={() => onStudentClick(r.user_name)}
                className="w-full bg-sb-surface rounded-xl border border-sb-line px-4 py-3 flex items-center gap-3 hover:border-sb-primary-light hover:bg-sb-primary-paler transition-all cursor-pointer">
                <div className={`text-2xl font-extrabold w-14 text-right shrink-0 tabular-nums text-sb-primary-dark`}>
                  {r.accuracy}<span className="text-xs font-bold">%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sb-ink truncate">{r.user_name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${accent.chip}`}>
                      {r.unit_title.startsWith('CLOCK_L') ? r.unit_title.replace('CLOCK_L', '레벨 ') : r.unit_title}
                    </span>
                  </div>
                  <div className="text-xs text-sb-muted">{r.correct_answers?.length ?? 0}/{r.total_questions}문제 정답 · {fmtDateTime(r.created_at ?? undefined)}</div>
                </div>
                <button onClick={(e) => r.id && handleCopy(e, r.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold shrink-0 transition-all ${
                    isCopied ? 'bg-sb-correct-pale text-sb-correct-dark' : 'bg-sb-primary-pale text-sb-primary-dark hover:bg-sb-primary-light'
                  }`}>
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? '복사됨' : '링크'}
                </button>
                <ChevronRight size={16} className="text-sb-muted-softer shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-sb-bg flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      <Header />
      {!selectedBranch || !isBranchUnlocked ? BranchSelectView() : HistoryView()}
    </div>
  );
}
