import React, { useState, useMemo } from 'react';
import { AuthUser, Course, Student, StudentAttendanceMap, StudentGrade, ScheduleItem } from '../types';
import { calculateAttendanceSummary, calculateGrade, formatBadgeClass } from '../utils/calculations';
import { formatIndoDate } from '../utils/dateUtils';
import { 
  UserCheck, 
  BookOpen, 
  CalendarCheck2, 
  GraduationCap, 
  CalendarDays, 
  Printer, 
  ShieldCheck, 
  Lock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  FileSpreadsheet, 
  Check, 
  Info,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Download
} from 'lucide-react';

interface StudentPortalViewProps {
  currentUser: AuthUser;
  students: Student[];
  courses: Course[];
  attendanceMap: StudentAttendanceMap;
  grades: Record<string, Record<string, StudentGrade>>;
  schedules: ScheduleItem[];
  activeSemester: string;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  students,
  courses,
  attendanceMap,
  grades,
  schedules,
  activeSemester,
}) => {
  const [activeStudentTab, setActiveStudentTab] = useState<'dashboard' | 'attendance' | 'grades' | 'schedule'>('dashboard');

  // Find the student record matching currentUser NIM or studentId
  const currentStudent = useMemo(() => {
    if (currentUser.studentId) {
      const found = students.find((s) => s.id === currentUser.studentId);
      if (found) return found;
    }
    if (currentUser.nim) {
      const found = students.find((s) => s.nim === currentUser.nim);
      if (found) return found;
    }
    // Fallback if not found
    return {
      id: currentUser.id,
      nim: currentUser.nim || '2110112001',
      nama: currentUser.nama,
      prodi: currentUser.prodi || 'Ilmu Hukum',
      angkatan: '2021',
      noHp: '',
      email: currentUser.email,
      jenisKelamin: 'L' as const,
      semester: activeSemester,
    };
  }, [currentUser, students, activeSemester]);

  // Filter courses taken by this student
  const studentCourses = useMemo(() => {
    return courses.filter((c) => {
      // 1. If student explicitly has courseIds
      if (currentStudent.courseIds && currentStudent.courseIds.includes(c.id)) {
        return true;
      }
      // 2. If student has attendance or grade records in this course
      if (attendanceMap[c.id]?.[currentStudent.id]) {
        return true;
      }
      if (grades[c.id]?.[currentStudent.id]) {
        return true;
      }
      // 3. Fallback default: if student has no courses, show courses matching student's semester or first 3
      if (!currentStudent.courseIds || currentStudent.courseIds.length === 0) {
        return true;
      }
      return false;
    });
  }, [courses, currentStudent, attendanceMap, grades]);

  // Selected course for attendance detail tab
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    return studentCourses[0]?.id || courses[0]?.id || '';
  });

  // Ensure selectedCourseId stays valid if courses change
  const activeCourse = useMemo(() => {
    return studentCourses.find((c) => c.id === selectedCourseId) || studentCourses[0] || courses[0];
  }, [studentCourses, selectedCourseId, courses]);

  // Calculate student's overall stats
  const academicSummary = useMemo(() => {
    let totalSks = 0;
    let totalSksLulus = 0;
    let totalBobotMutu = 0;
    let totalAttendancePercent = 0;
    let countedAttendanceCourses = 0;
    let criticalWarningCount = 0;

    const courseDetails = studentCourses.map((c) => {
      totalSks += c.sks || 3;
      const attSummary = calculateAttendanceSummary(currentStudent, c, attendanceMap[c.id]?.[currentStudent.id] || {});
      const studentGrade = grades[c.id]?.[currentStudent.id] || {
        studentId: currentStudent.id,
        courseId: c.id,
        tugas: 80,
        kuis: 80,
        uts: 80,
        uas: 80,
      };
      const gradeResult = calculateGrade(currentStudent, c, studentGrade, attSummary);

      if (attSummary.totalMeetingsHeld > 0) {
        totalAttendancePercent += attSummary.percentage;
        countedAttendanceCourses += 1;
      }

      if (gradeResult.statusKelulusan === 'LULUS') {
        totalSksLulus += c.sks || 3;
      }

      totalBobotMutu += gradeResult.angkaMutu * (c.sks || 3);

      if (attSummary.status === 'critical') {
        criticalWarningCount += 1;
      }

      return {
        course: c,
        attendance: attSummary,
        grade: gradeResult,
      };
    });

    const avgAttendance = countedAttendanceCourses > 0 
      ? Math.round(totalAttendancePercent / countedAttendanceCourses) 
      : 100;

    const ips = totalSks > 0 ? (totalBobotMutu / totalSks).toFixed(2) : '3.80';

    return {
      totalSks,
      totalSksLulus,
      ips,
      avgAttendance,
      criticalWarningCount,
      courseDetails,
    };
  }, [studentCourses, currentStudent, attendanceMap, grades]);

  // Print KHS function
  const handlePrintKHS = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shrink-0">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={currentStudent.nama}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Mahasiswa Aktif
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-mono px-2.5 py-0.5 rounded-full">
                  NIM: {currentStudent.nim}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {currentStudent.nama}
              </h1>
              <p className="text-xs text-blue-200/80 mt-0.5">
                {currentStudent.prodi} • Angkatan {currentStudent.angkatan || '2021'} • {activeSemester}
              </p>
            </div>
          </div>

          {/* Quick Academic Summary Badges */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 bg-white/5 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-[11px] text-blue-200 font-medium">IPS Perkiraan</div>
              <div className="text-lg sm:text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {academicSummary.ips}
              </div>
            </div>
            <div className="text-center px-2 border-x border-white/10">
              <div className="text-[11px] text-blue-200 font-medium">SKS Diambil</div>
              <div className="text-lg sm:text-2xl font-extrabold text-white font-mono mt-0.5">
                {academicSummary.totalSks} <span className="text-xs font-normal text-blue-300">SKS</span>
              </div>
            </div>
            <div className="text-center px-2">
              <div className="text-[11px] text-blue-200 font-medium">Kehadiran Rata2</div>
              <div className="text-lg sm:text-2xl font-extrabold text-cyan-300 font-mono mt-0.5">
                {academicSummary.avgAttendance}%
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Notice Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hak Akses Mahasiswa: <strong>Mode Baca (Read-Only)</strong>. Presensi dan Nilai diverifikasi resmi oleh Dosen Pengampu.</span>
          </div>
          <button
            onClick={handlePrintKHS}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak KHS / Transkrip</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Mahasiswa */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveStudentTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeStudentTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ringkasan Perkuliahan</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeStudentTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Presensi 14 Pertemuan</span>
          {academicSummary.criticalWarningCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {academicSummary.criticalWarningCount} Kritis
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStudentTab('grades')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeStudentTab === 'grades'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Kartu Hasil Studi (KHS) & Nilai</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeStudentTab === 'schedule'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Jadwal Kuliah Saya</span>
        </button>
      </div>

      {/* TAB 1: STUDENT DASHBOARD */}
      {activeStudentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Status Alert if any critical course */}
          {academicSummary.criticalWarningCount > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-950">Peringatan Kehadiran!</h4>
                  <p className="mt-0.5">
                    Terdapat {academicSummary.criticalWarningCount} mata kuliah dengan batas ketidakhadiran melebihi 25% (berisiko tidak diizinkan mengikuti Ujian Akhir Semester). Segera temui dosen pengampu!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudentTab('attendance')}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition shrink-0"
              >
                Lihat Presensi
              </button>
            </div>
          )}

          {/* Enrolled Courses Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Mata Kuliah yang Diambil ({studentCourses.length} Mata Kuliah • {academicSummary.totalSks} SKS)</span>
              </h3>
              <span className="text-xs text-slate-500">{activeSemester}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academicSummary.courseDetails.map(({ course, attendance, grade }) => {
                const isSafe = attendance.percentage >= (course.minAttendancePercent || 75);
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          {course.kode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                            {course.sks} SKS
                          </span>
                          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100">
                            {course.kelas}
                          </span>
                        </div>
                      </div>

                      {/* Course Title */}
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                        {course.nama}
                      </h4>

                      {/* Lecturer */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{course.dosenPengampu}</span>
                      </div>

                      {/* Schedule & Room */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.jadwalHari}, {course.jamMulai}-{course.jamSelesai} ({course.ruangan})</span>
                      </div>

                      {/* Attendance Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500 font-medium">Presensi (14 Pertemuan):</span>
                          <span className={`font-bold font-mono ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {attendance.percentage}% ({attendance.hadir} Hadir, {attendance.alpa} Alpa)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              attendance.percentage >= 75 ? 'bg-emerald-500' : attendance.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, attendance.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer with Exam Eligibility & Letter Grade */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {attendance.isEligibleForExam ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Layak Ujian
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Tidak Layak
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500">Mutu:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md font-mono ${
                          grade.hurufMutu === 'A' || grade.hurufMutu === 'A-' ? 'bg-emerald-100 text-emerald-800' :
                          grade.hurufMutu.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          grade.hurufMutu.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {grade.hurufMutu} ({grade.angkaMutu})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE 14 MEETINGS DETAIL (READ-ONLY) */}
      {activeStudentTab === 'attendance' && (
        <div className="space-y-6">
          {/* Course Selector */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Pilih Mata Kuliah untuk Melihat Rincian Presensi:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {studentCourses.map((c) => {
                const isSelected = c.id === activeCourse.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    <span className="font-mono text-[11px]">{c.kode}</span>
                    <span className="truncate max-w-[200px]">{c.nama}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                      isSelected ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.kelas}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Course Attendance Overview */}
          {activeCourse && (() => {
            const att = calculateAttendanceSummary(
              currentStudent,
              activeCourse,
              attendanceMap[activeCourse.id]?.[currentStudent.id] || {}
            );
            const isSafe = att.percentage >= (activeCourse.minAttendancePercent || 75);

            return (
              <div className="space-y-6">
                {/* Course Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                          {activeCourse.kode}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {activeCourse.sks} SKS • {activeCourse.kelas}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">
                        {activeCourse.nama}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Dosen: <strong>{activeCourse.dosenPengampu}</strong></span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activeCourse.jadwalHari}, {activeCourse.jamMulai}-{activeCourse.jamSelesai}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activeCourse.ruangan}</span>
                        </span>
                      </div>
                    </div>

                    {/* Stats Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[90px]">
                        <div className="text-[10px] text-slate-500 font-medium">Persentase</div>
                        <div className={`text-xl font-bold font-mono ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {att.percentage}%
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[90px]">
                        <div className="text-[10px] text-slate-500 font-medium">Status Ujian</div>
                        <div className={`text-xs font-bold mt-1 ${isSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isSafe ? 'LAYAK UAS' : 'TIDAK LAYAK'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Read-Only Notice Box */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Mode Tinjauan Mahasiswa: Kehadiran telah diverifikasi melalui presensi digital dosen. Jika ada ketidaksesuaian status, silakan konfirmasi kepada dosen pengampu.
                    </span>
                  </div>
                </div>

                {/* 14 Meetings Cards Grid */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Rincian Presensi 14 Pertemuan Kuliah
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((mNum) => {
                      const meeting = activeCourse.meetings?.find((m) => m.meetingNumber === mNum) || {
                        meetingNumber: mNum,
                        date: '-',
                        topic: `Pertemuan ${mNum}`,
                        mode: 'Tatap Muka' as const,
                        dosenHadir: true,
                      };
                      const status = attendanceMap[activeCourse.id]?.[currentStudent.id]?.[mNum] || null;

                      return (
                        <div
                          key={mNum}
                          className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                            status === 'H'
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : status === 'I'
                              ? 'bg-blue-50/70 border-blue-200'
                              : status === 'S'
                              ? 'bg-amber-50/70 border-amber-200'
                              : status === 'A'
                              ? 'bg-rose-50/70 border-rose-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-slate-800">
                                P-{mNum}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {meeting.date !== '-' ? formatIndoDate(meeting.date) : `Pekan ${mNum}`}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug mb-2" title={meeting.topic}>
                              {meeting.topic}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {meeting.mode}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md font-mono ${
                              status === 'H'
                                ? 'bg-emerald-600 text-white'
                                : status === 'I'
                                ? 'bg-blue-600 text-white'
                                : status === 'S'
                                ? 'bg-amber-600 text-white'
                                : status === 'A'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {status === 'H' ? 'HADIR' : status === 'I' ? 'IZIN' : status === 'S' ? 'SAKIT' : status === 'A' ? 'ALPA' : 'BELUM'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: KARTU HASIL STUDI (KHS) & NILAI (READ-ONLY) */}
      {activeStudentTab === 'grades' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            {/* KHS Document Header */}
            <div className="text-center pb-6 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                KARTU HASIL STUDI (KHS) SEMESTER
              </h2>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">
                FAKULTAS HUKUM • UNIVERSITAS ANDALAS • {activeSemester}
              </p>

              {/* Student Meta Details Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 rounded-2xl text-left border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">NAMA MAHASISWA</span>
                  <strong className="text-slate-900 font-bold">{currentStudent.nama}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">NOMOR INDUK (NIM)</span>
                  <strong className="text-slate-900 font-mono font-bold">{currentStudent.nim}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PROGRAM STUDI</span>
                  <strong className="text-slate-900 font-bold">{currentStudent.prodi}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">TAHUN AKADEMIK</span>
                  <strong className="text-slate-900 font-bold">{activeSemester}</strong>
                </div>
              </div>
            </div>

            {/* KHS Grades Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-3 px-3 rounded-tl-xl text-center">No</th>
                    <th className="py-3 px-3">Kode MK</th>
                    <th className="py-3 px-4">Nama Mata Kuliah</th>
                    <th className="py-3 px-3 text-center">SKS</th>
                    <th className="py-3 px-3 text-center">Kelas</th>
                    <th className="py-3 px-3 text-center">Presensi</th>
                    <th className="py-3 px-3 text-center">Tugas</th>
                    <th className="py-3 px-3 text-center">Kuis</th>
                    <th className="py-3 px-3 text-center">UTS</th>
                    <th className="py-3 px-3 text-center">UAS</th>
                    <th className="py-3 px-3 text-center font-bold text-amber-300">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center font-bold text-emerald-300">Huruf Mutu</th>
                    <th className="py-3 px-3 text-center font-bold">Angka Mutu</th>
                    <th className="py-3 px-3 text-center">SKS x Mutu</th>
                    <th className="py-3 px-3 rounded-tr-xl text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {academicSummary.courseDetails.map(({ course, attendance, grade }, idx) => {
                    const sksXMutu = ((course.sks || 3) * grade.angkaMutu).toFixed(2);
                    return (
                      <tr key={course.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-blue-700">{course.kode}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <div>{course.nama}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{course.dosenPengampu}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700">{course.sks}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{course.kelas}</td>
                        <td className="py-3 px-3 text-center font-mono">{attendance.percentage}%</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">{grade.tugas}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">{grade.kuis}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">{grade.uts}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">{grade.uas}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50">
                          {grade.nilaiAkhir}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded-md font-mono ${
                            grade.hurufMutu === 'A' || grade.hurufMutu === 'A-' ? 'bg-emerald-100 text-emerald-800' :
                            grade.hurufMutu.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                            grade.hurufMutu.startsWith('C') ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {grade.hurufMutu}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                          {grade.angkaMutu.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                          {sksXMutu}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            grade.statusKelulusan === 'LULUS'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {grade.statusKelulusan}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* KHS Cumulative Footer Calculation */}
            <div className="mt-6 p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total SKS Diambil</span>
                  <strong className="text-base sm:text-lg font-bold text-white font-mono">{academicSummary.totalSks} SKS</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Total SKS Lulus</span>
                  <strong className="text-base sm:text-lg font-bold text-emerald-400 font-mono">{academicSummary.totalSksLulus} SKS</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Indeks Prestasi Semester (IPS)</span>
                  <strong className="text-base sm:text-xl font-bold text-amber-300 font-mono">{academicSummary.ips} / 4.00</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Beban Maksimal Semester Depan</span>
                  <strong className="text-base sm:text-lg font-bold text-cyan-300 font-mono">24 SKS</strong>
                </div>
              </div>

              <button
                onClick={handlePrintKHS}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen KHS (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JADWAL KULIAH MAHASISWA */}
      {activeStudentTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>Jadwal Kuliah Mingguan ({studentCourses.length} Mata Kuliah)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Jadwal perkuliahan tatap muka & daring yang Anda ikuti pada semester ini.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {studentCourses.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-lg">
                      {c.jadwalHari}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      {c.jamMulai} - {c.jamSelesai} WIB
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {c.nama}
                  </h4>
                  <div className="text-xs text-slate-600 font-medium">
                    {c.kode} • {c.sks} SKS • {c.kelas}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.ruangan}</span>
                    </span>
                    <span className="truncate max-w-[130px] font-medium" title={c.dosenPengampu}>
                      {c.dosenPengampu}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
