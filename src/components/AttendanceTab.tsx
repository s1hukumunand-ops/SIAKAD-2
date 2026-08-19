import React, { useState } from 'react';
import { Course, Student, AttendanceStatus, StudentAttendanceMap, MeetingInfo } from '../types';
import { calculateAttendanceSummary, formatBadgeClass, generateWarningWhatsAppMessage } from '../utils/calculations';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCheck, 
  Send, 
  AlertTriangle, 
  Edit3, 
  UserPlus, 
  Download, 
  Check, 
  X, 
  Info,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface AttendanceTabProps {
  course: Course;
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  onUpdateAttendance: (studentId: string, meetingNum: number, status: AttendanceStatus) => void;
  onBulkUpdateAttendance: (meetingNum: number, status: AttendanceStatus) => void;
  onEditMeeting: (meeting: MeetingInfo) => void;
  onOpenAddStudent: () => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  course,
  students,
  attendanceMap,
  onUpdateAttendance,
  onBulkUpdateAttendance,
  onEditMeeting,
  onOpenAddStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'warning' | 'critical'>('all');
  const [activeMeetingDetail, setActiveMeetingDetail] = useState<MeetingInfo | null>(null);

  const courseAttendance = attendanceMap[course.id] || {};

  // Compute summary for every student
  const studentSummaries = students.map((student) => {
    const records = courseAttendance[student.id];
    const summary = calculateAttendanceSummary(student, course, records);
    return {
      student,
      records: records || {},
      summary,
    };
  });

  // Filter students
  const filteredStudents = studentSummaries.filter(({ student, summary }) => {
    const matchesSearch = 
      student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nim.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    return summary.status === statusFilter;
  });

  // Cycle attendance status on click: null -> H -> I -> S -> A -> null
  const handleCellClick = (studentId: string, meetingNum: number) => {
    const current = courseAttendance[studentId]?.[meetingNum] || null;
    let next: AttendanceStatus = 'H';
    if (current === 'H') next = 'I';
    else if (current === 'I') next = 'S';
    else if (current === 'S') next = 'A';
    else if (current === 'A') next = null;
    else next = 'H';

    onUpdateAttendance(studentId, meetingNum, next);
  };

  const criticalCount = studentSummaries.filter((s) => s.summary.status === 'critical').length;
  const warningCount = studentSummaries.filter((s) => s.summary.status === 'warning').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Riwayat Presensi Kuliah (14 Pertemuan)
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {course.nama} ({course.kelas})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Klik pada kotak absensi untuk mengubah status: <strong className="text-emerald-700">H (Hadir)</strong> &rarr; <strong className="text-blue-700">I (Izin)</strong> &rarr; <strong className="text-amber-700">S (Sakit)</strong> &rarr; <strong className="text-rose-700">A (Alpa)</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="add-student-attendance-btn"
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Legend & Summary Badges Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Status:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong>H</strong> = Hadir
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <strong>I</strong> = Izin
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <strong>S</strong> = Sakit
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <strong>A</strong> = Alpa (Tanpa Ket.)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({studentSummaries.length})
          </button>
          <button
            onClick={() => setStatusFilter('safe')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Aman (&ge;75%)
          </button>
          <button
            onClick={() => setStatusFilter('warning')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'warning' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Rawan ({warningCount})
          </button>
          <button
            onClick={() => setStatusFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Dicekal ({criticalCount})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="search-attendance-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan NIM atau Nama Mahasiswa..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Attendance Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-3 font-semibold text-center w-12 sticky left-0 z-20 bg-slate-900">
                  No
                </th>
                <th className="py-3 px-3 font-semibold sticky left-12 z-20 bg-slate-900 min-w-[200px]">
                  Mahasiswa
                </th>
                
                {/* 14 Meetings Header Columns */}
                {Array.from({ length: 14 }, (_, i) => {
                  const meetingNum = i + 1;
                  const meeting = course.meetings.find((m) => m.meetingNumber === meetingNum);

                  return (
                    <th
                      key={meetingNum}
                      className="py-2.5 px-1.5 font-semibold text-center border-l border-slate-800 min-w-[50px] relative group"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold text-xs text-blue-300">P-{meetingNum}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {meeting?.date ? meeting.date.slice(5) : `Sesi ${meetingNum}`}
                        </span>

                        {/* Meeting Action buttons on hover */}
                        <div className="flex items-center gap-1 mt-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            title={`Tandai Semua Hadir di Pertemuan ${meetingNum}`}
                            onClick={() => onBulkUpdateAttendance(meetingNum, 'H')}
                            className="p-0.5 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white text-[9px]"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            title={`Edit Topik & Tanggal Pertemuan ${meetingNum}`}
                            onClick={() => meeting && onEditMeeting(meeting)}
                            className="p-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[9px]"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Recap Columns */}
                <th className="py-3 px-2 font-semibold text-center border-l border-slate-800 bg-slate-950/80">
                  H
                </th>
                <th className="py-3 px-2 font-semibold text-center border-l border-slate-800 bg-slate-950/80">
                  I
                </th>
                <th className="py-3 px-2 font-semibold text-center border-l border-slate-800 bg-slate-950/80">
                  S
                </th>
                <th className="py-3 px-2 font-semibold text-center border-l border-slate-800 bg-slate-950/80">
                  A
                </th>
                <th className="py-3 px-3 font-semibold text-center border-l border-slate-800 bg-slate-950/80 min-w-[90px]">
                  % Kehadiran
                </th>
                <th className="py-3 px-3 font-semibold text-center border-l border-slate-800 bg-slate-950/80 min-w-[130px]">
                  Status Ujian (UAS)
                </th>
                <th className="py-3 px-3 font-semibold text-center border-l border-slate-800 bg-slate-950/80">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={22} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada mahasiswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(({ student, records, summary }, idx) => {
                  const isCritical = summary.status === 'critical';
                  const isWarning = summary.status === 'warning';

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isCritical
                          ? 'bg-rose-50/30'
                          : isWarning
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono sticky left-0 bg-white z-10">
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-2.5 px-3 sticky left-12 bg-white z-10 border-r border-slate-100">
                        <div className="font-semibold text-slate-900 text-xs truncate max-w-[190px]">
                          {student.nama}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <span>NIM: {student.nim}</span>
                          <span className="text-slate-300">•</span>
                          <span>{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </div>
                      </td>

                      {/* 14 Meeting Matrix Cells */}
                      {Array.from({ length: 14 }, (_, i) => {
                        const mNum = i + 1;
                        const status = records[mNum] || null;

                        return (
                          <td
                            key={mNum}
                            className="py-1.5 px-1 text-center border-l border-slate-100 cursor-pointer select-none"
                            onClick={() => handleCellClick(student.id, mNum)}
                          >
                            <button
                              id={`cell-${student.id}-m${mNum}`}
                              className={`w-7 h-7 rounded-lg border text-xs font-bold transition flex items-center justify-center mx-auto shadow-2xs hover:scale-110 active:scale-95 ${formatBadgeClass(
                                status
                              )}`}
                              title={`Klik ganti status P-${mNum} untuk ${student.nama}`}
                            >
                              {status || '-'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td className="py-2 px-2 text-center font-semibold text-emerald-700 bg-slate-50/60 border-l border-slate-200">
                        {summary.hadir}
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-blue-700 bg-slate-50/60 border-l border-slate-100">
                        {summary.izin}
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-amber-700 bg-slate-50/60 border-l border-slate-100">
                        {summary.sakit}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-rose-700 bg-slate-50/60 border-l border-slate-100">
                        {summary.alpa}
                      </td>

                      {/* Percentage & Progress Bar */}
                      <td className="py-2 px-3 text-center border-l border-slate-200 bg-slate-50/40">
                        <div className="font-bold text-slate-900 text-xs">
                          {summary.percentage}%
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              summary.percentage >= 75
                                ? 'bg-emerald-500'
                                : summary.percentage >= 65
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${summary.percentage}%` }}
                          />
                        </div>
                      </td>

                      {/* Status Ujian Badge */}
                      <td className="py-2 px-3 text-center border-l border-slate-200">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            DICEKAL UAS
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            RAWAN ({summary.remainingAbsence} Sisa)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            MEMENUHI SYARAT
                          </span>
                        )}
                      </td>

                      {/* WhatsApp / Action */}
                      <td className="py-2 px-3 text-center border-l border-slate-200">
                        <a
                          href={generateWarningWhatsAppMessage(student, course, summary)}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition shadow-2xs ${
                            isCritical
                              ? 'bg-rose-600 hover:bg-rose-700 text-white font-semibold'
                              : isWarning
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title={`Kirim Rekapitulasi Presensi WhatsApp ke ${student.nama}`}
                        >
                          <Send className="w-3 h-3" />
                          <span className="hidden xl:inline">Kirim WA</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 14 Meetings Topic Legend List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Silabus & Materi 14 Pertemuan Perkuliahan</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {course.meetings.map((m) => (
            <div
              key={m.meetingNumber}
              onClick={() => onEditMeeting(m)}
              className="p-2.5 rounded-xl border border-slate-200/90 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                <span className="text-blue-700">Pertemuan {m.meetingNumber}</span>
                <span className="text-[10px] text-slate-500 font-mono">{m.date || '-'}</span>
              </div>
              <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                {m.topic || 'Belum diisi topik'}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                <span className="bg-slate-200/80 px-1.5 py-0.2 rounded font-medium">
                  {m.mode}
                </span>
                <span className="text-blue-600 group-hover:underline font-medium">
                  Edit Topik
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
