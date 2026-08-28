import React, { useMemo } from 'react';
import { Course, Student, StudentAttendanceMap, StudentGrade, ScheduleItem } from '../types';
import { calculateAttendanceSummary, calculateGrade, generateWarningWhatsAppMessage, getCourseStudents } from '../utils/calculations';
import { SEMESTER_OPTIONS, DEFAULT_ACTIVE_SEMESTER } from '../utils/dateUtils';
import { CourseSelectorBar } from './CourseSelectorBar';
import { 
  Users, 
  CalendarCheck2, 
  AlertOctagon, 
  Award, 
  Send, 
  Clock, 
  ArrowRight, 
  FileSpreadsheet, 
  AlertTriangle,
  CheckCircle,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  Plus,
  UserPlus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { Edit3 } from 'lucide-react';

interface DashboardTabProps {
  course?: Course | null;
  courses: Course[];
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  grades: Record<string, Record<string, StudentGrade>>;
  schedules: ScheduleItem[];
  activeSemester: string;
  onSelectSemester: (semester: string) => void;
  onSelectCourse: (courseId: string) => void;
  onNavigateTab: (tab: 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report') => void;
  onSelectStudentForWarning?: (studentId: string) => void;
  onOpenAddCourse?: () => void;
  onOpenAddStudent?: () => void;
  onEditStudent?: (student: Student) => void;
  pinnedCourseIds?: string[];
  onTogglePinCourse?: (courseId: string) => void;
  onOpenSearchModal?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  course,
  courses,
  students,
  attendanceMap,
  grades,
  schedules,
  activeSemester,
  onSelectSemester,
  onSelectCourse,
  onNavigateTab,
  onOpenAddCourse,
  onOpenAddStudent,
  onEditStudent,
  pinnedCourseIds = [],
  onTogglePinCourse = () => {},
  onOpenSearchModal = () => {},
}) => {
  // All available semesters from courses list + predefined options
  const availableSemesters = useMemo(() => {
    const list = Array.from(new Set([
      DEFAULT_ACTIVE_SEMESTER,
      ...courses.map((c) => c.semester).filter(Boolean),
      ...SEMESTER_OPTIONS,
    ]));
    return list;
  }, [courses]);

  // Filtered courses based on active semester
  const semesterCourses = useMemo(() => {
    if (activeSemester === 'Semua Semester') {
      return courses;
    }
    return courses.filter((c) => c.semester === activeSemester);
  }, [courses, activeSemester]);

  // Course to display: if active course is in semesterCourses use it, else first in list (null if empty)
  const activeCourse = useMemo(() => {
    if (semesterCourses.length === 0) return null;
    const found = semesterCourses.find((c) => c.id === course?.id);
    return found || semesterCourses[0] || null;
  }, [semesterCourses, course]);

  const courseAttendance = attendanceMap[activeCourse?.id || ''] || {};
  const courseGrades = grades[activeCourse?.id || ''] || {};

  // Filter students based on active course & semester
  const courseStudents = useMemo(() => {
    if (!activeCourse) return [];
    return getCourseStudents(students, activeCourse, activeSemester);
  }, [students, activeCourse, activeSemester]);

  // Compute attendance summaries for course-enrolled students
  const summaries = useMemo(() => {
    if (!activeCourse) return [];
    return courseStudents.map((std) => 
      calculateAttendanceSummary(std, activeCourse, courseAttendance[std.id])
    );
  }, [courseStudents, activeCourse, courseAttendance]);

  const totalStudents = courseStudents.length;
  const criticalStudents = summaries.filter((s) => s.status === 'critical');
  const warningStudents = summaries.filter((s) => s.status === 'warning');
  const safeStudents = summaries.filter((s) => s.status === 'safe');

  const avgAttendance = totalStudents > 0
    ? Math.round(summaries.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents)
    : 0;

  // Grade distributions
  const calculatedGrades = useMemo(() => {
    if (!activeCourse) return [];
    return courseStudents.map((std) => {
      const summary = summaries.find((s) => s.student.id === std.id);
      if (!summary) return null;
      return calculateGrade(std, activeCourse, courseGrades[std.id], summary);
    }).filter(Boolean) as any[];
  }, [courseStudents, activeCourse, courseGrades, summaries]);

  const gradeCount: Record<string, number> = {
    'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0
  };
  let lulusCount = 0;
  let tidakLulusCount = 0;

  calculatedGrades.forEach((g) => {
    if (gradeCount[g.hurufMutu] !== undefined) {
      gradeCount[g.hurufMutu]++;
    }
    if (g.statusKelulusan === 'LULUS') lulusCount++;
    else tidakLulusCount++;
  });

  const gradeChartData = Object.entries(gradeCount).map(([grade, count]) => ({
    name: grade,
    jumlah: count,
  }));

  // Attendance status distribution pie chart data
  const attendancePieData = [
    { name: 'Aman (≥75%)', value: safeStudents.length, color: '#10b981' },
    { name: 'Peringatan (Batas Kritis)', value: warningStudents.length, color: '#f59e0b' },
    { name: 'Kritis (Dicekal UAS)', value: criticalStudents.length, color: '#ef4444' },
  ];

  // Aggregated 14 meetings attendance counts
  const meetingBreakdown = Array.from({ length: 14 }, (_, i) => {
    const meetingNum = i + 1;
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    courseStudents.forEach((s) => {
      const rec = courseAttendance[s.id]?.[meetingNum];
      if (rec === 'H') hadir++;
      else if (rec === 'I') izin++;
      else if (rec === 'S') sakit++;
      else if (rec === 'A') alpa++;
    });

    return {
      name: `P-${meetingNum}`,
      meetingNum,
      Hadir: hadir,
      Izin: izin,
      Sakit: sakit,
      Alpa: alpa,
    };
  });

  const completedMeetingsCount = activeCourse?.meetings?.filter((m) => m.isCompleted)?.length || 0;
  const totalSemesterSks = semesterCourses.reduce((acc, c) => acc + (c.sks || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Semester Filter Selector Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Semester Aktif</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {semesterCourses.length} Mata Kuliah Terdaftar
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Pilih Semester untuk Menampilkan Data Perkuliahan
            </h2>
          </div>
        </div>

        {/* Action Controls: Semester Dropdown & Tambah Mata Kuliah */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200 px-3 py-1.5 rounded-xl">
            <label htmlFor="active-semester-select" className="text-xs font-semibold text-blue-900 whitespace-nowrap">
              Semester:
            </label>
            <select
              id="active-semester-select"
              value={activeSemester}
              onChange={(e) => {
                const newSem = e.target.value;
                onSelectSemester(newSem);
                // If current course not in new semester, pick the first matching course
                const matching = newSem === 'Semua Semester' ? courses : courses.filter((c) => c.semester === newSem);
                if (matching.length > 0) {
                  onSelectCourse(matching[0].id);
                }
              }}
              className="bg-transparent text-xs font-bold text-blue-950 focus:outline-none cursor-pointer"
            >
              <option value="Semua Semester">Semua Semester ({courses.length} MK)</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem} {courses.some(c => c.semester === sem) ? `(${courses.filter(c => c.semester === sem).length} MK)` : ''}
                </option>
              ))}
            </select>
          </div>

          {onOpenAddCourse && (
            <button
              id="dashboard-add-course-btn"
              onClick={onOpenAddCourse}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mata Kuliah</span>
            </button>
          )}
        </div>
      </div>

      {/* If No Courses Exist in This Semester */}
      {!activeCourse || semesterCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Data Semester {activeSemester} Belum Tersedia
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Belum ada mata kuliah, mahasiswa, jadwal, maupun data presensi untuk semester yang dipilih ({activeSemester}). Silakan tambahkan mata kuliah baru untuk semester ini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onOpenAddCourse && (
              <button
                onClick={onOpenAddCourse}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Mata Kuliah Baru</span>
              </button>
            )}
            {onOpenAddStudent && (
              <button
                onClick={onOpenAddStudent}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition border border-slate-200 shadow-2xs"
              >
                <UserPlus className="w-4 h-4 text-slate-600" />
                <span>Tambah Mahasiswa</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Course Selector Bar for 400+ Courses */}
          {semesterCourses.length > 0 && (
            <CourseSelectorBar
              courses={courses}
              activeCourse={activeCourse}
              activeSemester={activeSemester}
              students={students}
              attendanceMap={attendanceMap}
              pinnedCourseIds={pinnedCourseIds}
              onTogglePinCourse={onTogglePinCourse}
              onSelectCourse={onSelectCourse}
              onOpenAddCourse={onOpenAddCourse}
              onOpenSearchModal={onOpenSearchModal}
              titlePrefix="Pilih Mata Kuliah & Kelas"
            />
          )}

          {/* Top Banner & Quick Status for Active Course */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-blue-900/40 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-500/30 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-400/30 font-semibold">
                    {activeCourse.semester}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                    Aktif • {completedMeetingsCount}/14 Pertemuan
                  </span>
                  <span className="bg-slate-700/50 text-slate-200 text-xs px-2.5 py-0.5 rounded-full border border-slate-600 font-medium">
                    {activeCourse.jadwalHari} ({activeCourse.jamMulai} - {activeCourse.jamSelesai})
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {activeCourse.nama}
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Kode: <span className="text-white font-semibold">{activeCourse.kode}</span> • SKS: <span className="text-white font-semibold">{activeCourse.sks}</span> • Kelas: <span className="text-white font-semibold">{activeCourse.kelas}</span> • Ruangan: <span className="text-white font-semibold">{activeCourse.ruangan}</span> • Dosen: {activeCourse.dosenPengampu}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  id="dashboard-goto-attendance-btn"
                  onClick={() => onNavigateTab('attendance')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl font-medium transition shadow-md flex items-center gap-2"
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  <span>Isi Presensi 14 Pertemuan</span>
                </button>
                <button
                  id="dashboard-goto-grades-btn"
                  onClick={() => onNavigateTab('grades')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-medium transition border border-slate-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  <span>Kelola Nilai</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Mahasiswa */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Mahasiswa</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalStudents}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>{activeCourse.kelas}</span> • <span>Angkatan {courseStudents[0]?.angkatan || '-'}</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              {onOpenAddStudent && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={onOpenAddStudent}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Mahasiswa</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Database Mhs</span>
                </div>
              )}
            </div>

            {/* Tingkat Kehadiran Rata-rata */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Kehadiran</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{avgAttendance}%</h3>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 w-28">
                    <div 
                      className={`h-1.5 rounded-full ${avgAttendance >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${avgAttendance}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarCheck2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Mahasiswa Kritis / Dicekal (<75%) */}
            <div 
              onClick={() => onNavigateTab('warning')}
              className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm hover:shadow-md transition cursor-pointer group bg-gradient-to-br from-white to-rose-50/40"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Dicekal UAS (&lt;75%)</p>
                    {criticalStudents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-rose-600 mt-1">
                    {criticalStudents.length} <span className="text-sm font-normal text-slate-500">Mhs</span>
                  </h3>
                  <p className="text-xs text-rose-700 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                    <span>Lihat & Beri Peringatan</span>
                    <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
                  <AlertOctagon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Kelulusan & Predikat */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tingkat Kelulusan</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {totalStudents > 0 ? Math.round((lulusCount / totalStudents) * 100) : 0}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    <strong className="text-emerald-600">{lulusCount} Lulus</strong> • <span className="text-rose-500">{tidakLulusCount} Gagal</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

      {/* CRITICAL WARNING ALERT TICKER */}
      {criticalStudents.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  Perhatian: {criticalStudents.length} Mahasiswa Terancam Dicekal dari Ujian Akhir Semester (UAS)!
                </h4>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  Mahasiswa berikut memiliki kehadiran kurang dari standar minimal <strong>{activeCourse.minAttendancePercent}%</strong> (alpa lebih dari 3 kali pertemuan). Silakan kirimkan notifikasi peringatan via WhatsApp.
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {criticalStudents.map((cs) => (
                    <div 
                      key={cs.student.id} 
                      className="bg-white border border-rose-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 flex items-center gap-2 shadow-xs"
                    >
                      <span className="font-semibold text-rose-700">{cs.student.nama}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({cs.alpa}x Alpa, {cs.percentage}%)</span>
                      <a
                        href={generateWarningWhatsAppMessage(cs.student, activeCourse, cs)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition"
                        title="Kirim Notifikasi WA Langsung"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Kirim WA</span>
                      </a>
                      {onEditStudent && (
                        <button
                          type="button"
                          onClick={() => onEditStudent(cs.student)}
                          className="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition"
                          title={`Edit data ${cs.student.nama}`}
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('warning')}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition shadow-xs"
            >
              Kelola Peringatan
            </button>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance per Meeting (14 Meetings Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rekapitulasi Presensi per Pertemuan (1 - 14)</h3>
              <p className="text-xs text-slate-500">Jumlah Mahasiswa Hadir, Izin, Sakit, dan Alpa setiap sesi tatap muka</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              14 Pertemuan Kuliah
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={meetingBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Hadir" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Izin" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Sakit" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Alpa" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Kehadiran Mahasiswa (Pie Chart) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Status Kelayakan Ujian (UAS)</h3>
            <p className="text-xs text-slate-500 mb-2">Berdasarkan pemenuhan standar kehadiran {activeCourse.minAttendancePercent}%</p>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-700">Aman (&ge; 75%)</span>
              </div>
              <span className="font-bold text-slate-900">{safeStudents.length} Mahasiswa</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-700">Rawan / Peringatan</span>
              </div>
              <span className="font-bold text-slate-900">{warningStudents.length} Mahasiswa</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="text-slate-700">Kritis (Dicekal UAS)</span>
              </div>
              <span className="font-bold text-rose-600">{criticalStudents.length} Mahasiswa</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grade Distribution & Today's Schedule Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Distribusi Nilai Mutu */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Distribusi Huruf Mutu (A - E)</h3>
              <p className="text-xs text-slate-500">Kalkulasi otomatis dari Kehadiran ({activeCourse.gradeWeights.kehadiran}%), Tugas ({activeCourse.gradeWeights.tugas}%), Kuis ({activeCourse.gradeWeights.kuis}%), UTS ({activeCourse.gradeWeights.uts}%), UAS ({activeCourse.gradeWeights.uas}%)</p>
            </div>
            <button
              onClick={() => onNavigateTab('grades')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Edit Nilai</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Bar dataKey="jumlah" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jadwal Kuliah & Ruangan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-base">Jadwal Kuliah Mingguan</h3>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Semua Jadwal
            </button>
          </div>

          <div className="space-y-2.5">
            {schedules.slice(0, 4).map((sch) => (
              <div
                key={sch.id}
                className={`p-3 rounded-xl border text-xs transition ${
                  sch.courseId === activeCourse.id
                    ? 'bg-blue-50/80 border-blue-200'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="truncate max-w-[160px]">{sch.namaMK}</span>
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                    {sch.hari}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {sch.jamMulai} - {sch.jamSelesai}
                  </span>
                  <span>{sch.ruangan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
        </>
      )}

    </div>
  );
};
