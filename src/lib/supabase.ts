import { createClient } from '@supabase/supabase-js';

// VOCATEST와 동일한 Supabase 프로젝트
const supabaseUrl = 'https://pujiailalhhytbxvsrxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1amlhaWxhbGhoeXRieHZzcnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzQ0MDcsImV4cCI6MjA4NDU1MDQwN30.Xvg5hXg_dINFkps4yoSJ0LEIxDLXMhDPSOVheIPpgHk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Types
// ============================================

export interface MathResultRow {
  id?: string;
  user_name: string;
  book_title: string;       // "산성비 연산 게임"
  unit_title: string;       // "G1_C01_U01" 등
  unit_display_name: string; // "+1 릴레이" 등
  grade_id: string;         // "G1", "G2", "G3"
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  missed_count: number;
  score: number;            // 점수 (게임 스코어)
  accuracy: number;         // 정답률 (0~100)
  max_combo: number;
  time_seconds: number;
  correct_answers: MathCorrectAnswer[];
  incorrect_answers: MathIncorrectAnswer[];
  student_id?: string | null;
  academy_id?: string | null;
  created_at?: string;
}

export interface MathCorrectAnswer {
  expression: string;
  answer: number;
  unitId: string;
}

export interface MathIncorrectAnswer {
  problemId?: string;
  expression: string;
  correctAnswer: number;
  userAnswer: number | null;
  result: 'wrong' | 'missed';
  unitId: string;
}

export interface StudentRow {
  id: string;
  name: string;
  grade: string | null;
  academy_id: string | null;
  created_at?: string;
}

export interface AcademyRow {
  id: string;
  name: string;
  code: string;
}

export interface ClassRow {
  id: string;
  name: string;
  student_ids: string[];
  test_code: string | null;
  academy_id?: string;
}

// ============================================
// Academy / Session Storage
// ============================================

export function setCurrentAcademy(academy: AcademyRow) {
  sessionStorage.setItem('currentAcademy', JSON.stringify(academy));
}

export function getCurrentAcademy(): AcademyRow | null {
  const stored = sessionStorage.getItem('currentAcademy');
  return stored ? JSON.parse(stored) : null;
}

export function getCurrentAcademyId(): string | null {
  return getCurrentAcademy()?.id ?? null;
}

// ============================================
// Academy Code Lookup (Student-side)
// ============================================

// ============================================
// Student Functions (shared with Speaking App)
// ============================================

export async function findStudent(name: string, academyId: string): Promise<StudentRow | null> {
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('name', name.trim())
    .eq('academy_id', academyId)
    .order('created_at', { ascending: true })
    .limit(1);

  return data && data.length > 0 ? data[0] : null;
}

export async function createStudentProfile(name: string, academyId: string): Promise<StudentRow | null> {
  const { data, error } = await supabase
    .from('students')
    .insert([{ name: name.trim(), academy_id: academyId }])
    .select()
    .single();

  if (error) {
    console.error('Failed to create student:', error);
    return null;
  }
  return data;
}

export async function addStudentToClass(classId: string, studentId: string): Promise<boolean> {
  const { data: classRow, error: fetchError } = await supabase
    .from('classes')
    .select('student_ids')
    .eq('id', classId)
    .single();

  if (fetchError || !classRow) {
    console.error('Failed to get class before adding student:', fetchError);
    return false;
  }

  const ids: string[] = classRow.student_ids || [];
  if (ids.includes(studentId)) return true;

  const { error } = await supabase
    .from('classes')
    .update({ student_ids: [...ids, studentId] })
    .eq('id', classId);

  if (error) {
    console.error('Failed to add student to class:', error);
    return false;
  }
  return true;
}

// ============================================
// Math Results
// ============================================

export async function saveMathResult(
  result: Omit<MathResultRow, 'id' | 'created_at'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('math_results')
    .insert([result])
    .select('id')
    .single();

  if (error) {
    console.error('Failed to save math result:', error);
    return null;
  }
  return data.id;
}

export async function getMathResult(id: string): Promise<MathResultRow | null> {
  const { data, error } = await supabase
    .from('math_results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to get math result:', error);
    return null;
  }
  return data;
}

export async function getAllMathResults(academyId?: string | null): Promise<MathResultRow[]> {
  let query = supabase
    .from('math_results')
    .select('*')
    .eq('book_title', 'TES 시계')   // ← 시계 앱 전용 결과만
    .order('created_at', { ascending: false });

  if (academyId) {
    query = query.or(`academy_id.eq.${academyId},academy_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to get math results:', error);
    return [];
  }

  return data ?? [];
}

export async function deleteStudentMathResults(userName: string): Promise<boolean> {
  const { error } = await supabase
    .from('math_results')
    .delete()
    .eq('user_name', userName);
  if (error) { console.error('Failed to delete student math results:', error); return false; }
  return true;
}

export async function deleteAllMathResults(academyId?: string | null): Promise<boolean> {
  if (!academyId) return false;
  
  // 먼저 현재 화면에 보이는(또는 소속된) 모든 결과의 ID를 가져옵니다. (테스트용 null 포함)
  const { data, error: fetchErr } = await supabase
    .from('math_results')
    .select('id')
    .or(`academy_id.eq.${academyId},academy_id.is.null`);

  if (fetchErr || !data) {
    console.error('Failed to fetch math results for deletion:', fetchErr);
    return false;
  }

  const ids = data.map(d => d.id);
  if (ids.length === 0) return true;

  // ID 배열을 통해 삭제
  const { error } = await supabase
    .from('math_results')
    .delete()
    .in('id', ids);

  if (error) { 
    console.error('Failed to delete all math results:', error); 
    return false; 
  }
  return true;
}

export async function getStudentMathResults(userName: string): Promise<MathResultRow[]> {
  const { data, error } = await supabase
    .from('math_results')
    .select('*')
    .eq('user_name', userName)
    .order('created_at', { ascending: false });
  if (error) { console.error('Failed to get student math results:', error); return []; }
  return data ?? [];
}

// ============================================
// Class Management (for admin)
// ============================================

export async function getClasses(_academyId?: string | null): Promise<ClassRow[]> {
  const query = supabase.from('classes').select('*').order('name');
  const { data, error } = await query;
  if (error) { console.error('Failed to get classes:', error); return []; }
  return data ?? [];
}

export async function createClass(name: string, studentIds: string[] = []): Promise<ClassRow | null> {
  const testCode = generateTestCode();
  const { data, error } = await supabase
    .from('classes')
    .insert([{ name, student_ids: studentIds, type: 'group', test_code: testCode }])
    .select()
    .single();
  if (error) { console.error('Failed to create class:', error); return null; }
  return data;
}

export async function updateClassStudents(classId: string, studentIds: string[]) {
  const { error } = await supabase
    .from('classes')
    .update({ student_ids: studentIds })
    .eq('id', classId);
  if (error) console.error('Failed to update class:', error);
  return !error;
}

export async function deleteClass(classId: string) {
  const { error } = await supabase.from('classes').delete().eq('id', classId);
  if (error) console.error('Failed to delete class:', error);
  return !error;
}

function generateTestCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'T';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================
// Student Management (for admin)
// ============================================

export async function getStudents(academyId?: string | null): Promise<StudentRow[]> {
  let query = supabase.from('students').select('*').order('created_at', { ascending: false });
  if (academyId) {
    query = query.eq('academy_id', academyId);
  }
  const { data, error } = await query;
  if (error) { console.error('Failed to get students:', error); return []; }
  return data ?? [];
}

export async function deleteStudentsAdmin(names: string[], academyId?: string | null): Promise<boolean> {
  if (!names.length) return false;
  
  // Delete from math_results
  const { error: err1 } = await supabase.from('math_results').delete().in('user_name', names);
  if (err1) { console.error('Failed to delete from math_results:', err1); return false; }

  // Delete from students
  let query = supabase.from('students').delete().in('name', names);
  if (academyId) query = query.eq('academy_id', academyId);
  const { error: err2 } = await query;
  if (err2) { console.error('Failed to delete from students:', err2); return false; }

  return true;
}

export async function renameStudentAdmin(oldName: string, newName: string, academyId?: string | null): Promise<boolean> {
  if (!oldName || !newName || oldName === newName) return false;

  // Update math_results
  const { error: err1 } = await supabase.from('math_results').update({ user_name: newName }).eq('user_name', oldName);
  if (err1) { console.error('Failed to update math_results name:', err1); return false; }

  // Update students table
  let query = supabase.from('students').update({ name: newName }).eq('name', oldName);
  if (academyId) query = query.eq('academy_id', academyId);
  const { error: err2 } = await query;
  if (err2) { console.error('Failed to rename in students:', err2); return false; }

  return true;
}

export async function mergeStudentsAdmin(sourceNames: string[], targetName: string, academyId?: string | null): Promise<boolean> {
  if (!sourceNames.length || !targetName) return false;
  const toMerge = sourceNames.filter(n => n !== targetName);
  if (!toMerge.length) return false;

  // 1. Update math_results for source names to target name
  const { error: err1 } = await supabase.from('math_results').update({ user_name: targetName }).in('user_name', toMerge);
  if (err1) { console.error('Failed to merge math_results:', err1); return false; }

  // 2. Delete source names from students table (since they are merged into target)
  let delQuery = supabase.from('students').delete().in('name', toMerge);
  if (academyId) delQuery = delQuery.eq('academy_id', academyId);
  const { error: err2 } = await delQuery;
  if (err2) { console.error('Failed to delete merged students:', err2); return false; }

  return true;
}
