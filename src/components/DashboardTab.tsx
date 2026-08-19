import React from 'react';
import { Course, Student, StudentAttendanceMap, StudentGrade, ScheduleItem } from '../types';
import { calculateAttendanceSummary, calculateGrade, generateWarningWhatsAppMessage } from '../utils/calculations';
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
  Sparkles
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

interface DashboardTabProps {
  course: Course;
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  grades: Record<string, Record<string, StudentGrade>>;
  schedules: ScheduleItem[];
  onNavigateTab: (tab: 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report') => void;
  onSelectStudentForWarning?: (studentId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  course,
  students,
  attendanceMap,
  grades,
  schedules,
  onNavigateTab,
}) => {
  const courseAttendance = attendanceMap[course.id] || {};
  const courseGrades = grades[course.id] || {};

  // Compute attendance summaries for all students
  const summaries = students.map((std) => 
    calculateAttendanceSummary(std, course, courseAttendance[std.id])
  );

  const totalStudents = students.length;
  const criticalStudents = summaries.filter((s) => s.status === 'critical');
  const warningStudents = summaries.filter((s) => s.status === 'warning');
  const safeStudents = summaries.filter((s) => s.status === 'safe');

  const avgAttendance = totalStudents > 0
    ? Math.round(summaries.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents)
    : 0;

  // Grade distributions
  const calculatedGrades = students.map((std) => {
    const summary = summaries.find((s) => s.student.id === std.id)!;
    return calculateGrade(std, course, courseGrades[std.id], summary);
  });

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

    students.forEach((s) => {
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

  const completedMeetingsCount = course.meetings.filter((m) => m.isCompleted).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Status */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-blue-900/40 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/30 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-400/30 font-medium">
                {course.semester}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                Aktif • {completedMeetingsCount}/14 Pertemuan
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {course.nama}
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Kode: <span className="text-white font-semibold">{course.kode}</span> • SKS: <span className="text-white font-semibold">{course.sks}</span> • Kelas: <span className="text-white font-semibold">{course.kelas}</span> • Dosen: {course.dosenPengampu}
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
                <span>{course.kelas}</span> • <span>Angkatan {students[0]?.angkatan || '2021'}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
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

      {/* CRITICAL WARNING ALERT TICKER (If any critical students exist) */}
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
                  Mahasiswa berikut memiliki kehadiran kurang dari standar minimal <strong>{course.minAttendancePercent}%</strong> (alpa lebih dari 3 kali pertemuan). Silakan kirimkan notifikasi peringatan via WhatsApp.
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
                        href={generateWarningWhatsAppMessage(cs.student, course, cs)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition"
                        title="Kirim Notifikasi WA Langsung"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Kirim WA</span>
                      </a>
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
            <p className="text-xs text-slate-500 mb-2">Berdasarkan pemenuhan standar kehadiran {course.minAttendancePercent}%</p>
            
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
              <p className="text-xs text-slate-500">Kalkulasi otomatis dari Kehadiran ({course.gradeWeights.kehadiran}%), Tugas ({course.gradeWeights.tugas}%), Kuis ({course.gradeWeights.kuis}%), UTS ({course.gradeWeights.uts}%), UAS ({course.gradeWeights.uas}%)</p>
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
                  sch.courseId === course.id
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

    </div>
  );
};
