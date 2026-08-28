import React, { useState, useMemo, useEffect } from 'react';
import { Course, Student, StudentAttendanceMap, StudentGrade } from '../types';
import { calculateAttendanceSummary, calculateGrade, getCourseStudents } from '../utils/calculations';
import { SEMESTER_OPTIONS, DEFAULT_ACTIVE_SEMESTER } from '../utils/dateUtils';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  X, 
  AlertTriangle, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  grades: Record<string, Record<string, StudentGrade>>;
  activeSemester?: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  course,
  students,
  attendanceMap,
  grades,
  activeSemester,
}) => {
  const [reportType, setReportType] = useState<'attendance' | 'grades' | 'barred'>('attendance');
  const [customSemester, setCustomSemester] = useState(
    activeSemester && activeSemester !== 'Semua Semester'
      ? activeSemester
      : (course.semester || DEFAULT_ACTIVE_SEMESTER)
  );

  useEffect(() => {
    if (activeSemester && activeSemester !== 'Semua Semester') {
      setCustomSemester(activeSemester);
    } else if (course?.semester) {
      setCustomSemester(course.semester);
    }
  }, [activeSemester, course?.semester, isOpen]);

  const currentSemesterDisplay = customSemester || course.semester || activeSemester || DEFAULT_ACTIVE_SEMESTER;
  const courseAttendance = attendanceMap[course.id] || {};
  const courseGrades = grades[course.id] || {};

  const courseStudents = useMemo(() => {
    return getCourseStudents(students, course, currentSemesterDisplay);
  }, [students, course, currentSemesterDisplay]);

  const summaries = useMemo(() => {
    return courseStudents.map((std) => 
      calculateAttendanceSummary(std, course, courseAttendance[std.id])
    );
  }, [courseStudents, course, courseAttendance]);

  const calculatedGrades = useMemo(() => {
    return courseStudents.map((std) => {
      const summary = summaries.find((s) => s.student.id === std.id)!;
      return calculateGrade(std, course, courseGrades[std.id], summary);
    });
  }, [courseStudents, course, courseGrades, summaries]);

  const barredStudents = useMemo(() => {
    return summaries.filter((s) => !s.isEligibleForExam);
  }, [summaries]);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'attendance') {
      csvContent += 'No,NIM,Nama Mahasiswa,Program Studi,' + Array.from({ length: 14 }, (_, i) => `P${i + 1}`).join(',') + ',Total Hadir,Total Izin,Total Sakit,Total Alpa,% Kehadiran,Status UAS\n';
      summaries.forEach((s, idx) => {
        const pValues = Array.from({ length: 14 }, (_, i) => courseAttendance[s.student.id]?.[i + 1] || '-').join(',');
        const row = `${idx + 1},"${s.student.nim}","${s.student.nama}","${s.student.prodi}",${pValues},${s.hadir},${s.izin},${s.sakit},${s.alpa},${s.percentage}%,${s.isEligibleForExam ? 'Memenuhi Syarat' : 'DICEKAL UAS'}`;
        csvContent += row + '\n';
      });
    } else if (reportType === 'grades') {
      csvContent += 'No,NIM,Nama Mahasiswa,Kehadiran,Tugas,Kuis,UTS,UAS,Nilai Akhir,Huruf Mutu,Angka Mutu,Status Kelulusan\n';
      calculatedGrades.forEach((g, idx) => {
        const row = `${idx + 1},"${g.student.nim}","${g.student.nama}",${g.kehadiranScore},${g.tugas},${g.kuis},${g.uts},${g.uas},${g.nilaiAkhir},"${g.hurufMutu}",${g.angkaMutu},"${g.statusKelulusan}"`;
        csvContent += row + '\n';
      });
    } else {
      csvContent += 'No,NIM,Nama Mahasiswa,Total Hadir,Total Alpa,% Kehadiran,Status\n';
      barredStudents.forEach((s, idx) => {
        const row = `${idx + 1},"${s.student.nim}","${s.student.nama}",${s.hadir},${s.alpa},${s.percentage}%,"DICEKAL UAS (<75%)"`;
        csvContent += row + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_${reportType}_${course.kode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in print:p-0 print:bg-transparent print:static print:inset-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col print:shadow-none print:border-none print:p-0 print:max-h-none print:w-full print:max-w-none print:bg-transparent">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cetak Laporan & Rekapitulasi Akademik</h3>
              <p className="text-xs text-slate-500">{course.nama} ({course.kode}) - {course.kelas}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Report Switcher & Export Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100 flex-shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setReportType('attendance')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  reportType === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rekap Presensi 14 Pertemuan
              </button>
              <button
                onClick={() => setReportType('grades')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  reportType === 'grades' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Nilai Akhir (DPNA)
              </button>
              <button
                onClick={() => setReportType('barred')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  reportType === 'barred' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                Daftar Pencekalan UAS ({barredStudents.length})
              </button>
            </div>

            {/* Semester Selector on Report */}
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-blue-900">Semester:</span>
              <select
                value={currentSemesterDisplay}
                onChange={(e) => setCustomSemester(e.target.value)}
                className="bg-transparent font-bold text-blue-950 focus:outline-none cursor-pointer"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-xl font-semibold transition border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-1.5 rounded-xl font-semibold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas Preview */}
        <div id="printable-report" className="flex-1 overflow-y-auto p-6 bg-slate-50 border border-slate-200 rounded-xl my-4 text-xs font-serif text-slate-900 space-y-4 print:p-0 print:border-none print:bg-white print:overflow-visible print:m-0">
          
          {/* Header Kop Surat */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider">KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI</h3>
            <h2 className="text-base font-black uppercase">UNIVERSITAS ANDALAS</h2>
            <p className="text-[11px] font-sans font-semibold text-slate-700">FAKULTAS HUKUM • PROGRAM STUDI S1 ILMU HUKUM</p>
            <p className="text-[10px] font-sans text-slate-500">Kampus Limau Manis, Padang 25163 • Laman: https://unand.ac.id</p>
          </div>

          {/* Form Title */}
          <div className="text-center pt-1 font-sans">
            <h4 className="font-bold text-xs uppercase underline">
              {reportType === 'attendance' && 'BERITA ACARA & REKAPITULASI PRESENSI MAHASISWA (14 PERTEMUAN)'}
              {reportType === 'grades' && 'DAFTAR PESERTA DAN NILAI AKHIR (DPNA)'}
              {reportType === 'barred' && 'BERITA ACARA PENCEKALAN UJIAN AKHIR SEMESTER (UAS) KARENA KEHADIRAN < 75%'}
            </h4>
            <p className="text-[11px] text-blue-900 font-bold mt-0.5">{currentSemesterDisplay}</p>
          </div>

          {/* Course Metadata Grid */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 font-sans grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div><span className="font-semibold text-slate-600">Mata Kuliah:</span> {course.nama} ({course.kode})</div>
            <div><span className="font-semibold text-slate-600">Dosen Pengampu:</span> {course.dosenPengampu}</div>
            <div><span className="font-semibold text-slate-600">Bobot SKS / Kelas:</span> {course.sks} SKS / {course.kelas}</div>
            <div><span className="font-semibold text-slate-600">Hari / Ruang:</span> {course.jadwalHari}, {course.jamMulai}-{course.jamSelesai} / {course.ruangan}</div>
          </div>

          {/* Report 1: Attendance Table */}
          {reportType === 'attendance' && (
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="p-1 text-center border border-slate-300 w-8">No</th>
                    <th className="p-1 border border-slate-300 min-w-[140px]">NIM & Nama Mahasiswa</th>
                    {Array.from({ length: 14 }, (_, i) => (
                      <th key={i} className="p-1 text-center border border-slate-300 w-6">P{i + 1}</th>
                    ))}
                    <th className="p-1 text-center border border-slate-300">H</th>
                    <th className="p-1 text-center border border-slate-300">I</th>
                    <th className="p-1 text-center border border-slate-300">S</th>
                    <th className="p-1 text-center border border-slate-300">A</th>
                    <th className="p-1 text-center border border-slate-300">% Hadir</th>
                    <th className="p-1 text-center border border-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.length === 0 ? (
                    <tr>
                      <td colSpan={23} className="p-8 text-center text-slate-500 font-semibold bg-slate-50 border border-slate-300">
                        Data mahasiswa belum tersedia pada mata kuliah dan semester yang dipilih ({currentSemesterDisplay}).
                      </td>
                    </tr>
                  ) : (
                    summaries.map((s, idx) => (
                      <tr key={s.student.id} className="border-b border-slate-200">
                        <td className="p-1 text-center border border-slate-300">{idx + 1}</td>
                        <td className="p-1 border border-slate-300 font-semibold">
                          {s.student.nama} <span className="font-mono text-[9px] text-slate-500">({s.student.nim})</span>
                        </td>
                        {Array.from({ length: 14 }, (_, i) => (
                          <td key={i} className="p-1 text-center border border-slate-300 font-bold">
                            {courseAttendance[s.student.id]?.[i + 1] || '-'}
                          </td>
                        ))}
                        <td className="p-1 text-center border border-slate-300 font-bold text-emerald-700">{s.hadir}</td>
                        <td className="p-1 text-center border border-slate-300">{s.izin}</td>
                        <td className="p-1 text-center border border-slate-300">{s.sakit}</td>
                        <td className="p-1 text-center border border-slate-300 font-bold text-rose-700">{s.alpa}</td>
                        <td className="p-1 text-center border border-slate-300 font-bold">{s.percentage}%</td>
                        <td className="p-1 text-center border border-slate-300 font-semibold">
                          {s.isEligibleForExam ? 'Memenuhi Syarat' : 'DICEKAL'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Report 2: Grades Table */}
          {reportType === 'grades' && (
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="p-1 text-center border border-slate-300 w-8">No</th>
                    <th className="p-1 border border-slate-300">NIM</th>
                    <th className="p-1 border border-slate-300 min-w-[160px]">Nama Mahasiswa</th>
                    <th className="p-1 text-center border border-slate-300">Presensi ({course.gradeWeights.kehadiran}%)</th>
                    <th className="p-1 text-center border border-slate-300">Tugas ({course.gradeWeights.tugas}%)</th>
                    <th className="p-1 text-center border border-slate-300">Kuis ({course.gradeWeights.kuis}%)</th>
                    <th className="p-1 text-center border border-slate-300">UTS ({course.gradeWeights.uts}%)</th>
                    <th className="p-1 text-center border border-slate-300">UAS ({course.gradeWeights.uas}%)</th>
                    <th className="p-1 text-center border border-slate-300 font-bold">Nilai Akhir</th>
                    <th className="p-1 text-center border border-slate-300 font-bold">Huruf</th>
                    <th className="p-1 text-center border border-slate-300">Bobot</th>
                    <th className="p-1 text-center border border-slate-300">Kelulusan</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedGrades.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-500 font-semibold bg-slate-50 border border-slate-300">
                        Data nilai mahasiswa belum tersedia pada mata kuliah dan semester yang dipilih ({currentSemesterDisplay}).
                      </td>
                    </tr>
                  ) : (
                    calculatedGrades.map((g, idx) => (
                      <tr key={g.student.id} className="border-b border-slate-200">
                        <td className="p-1 text-center border border-slate-300">{idx + 1}</td>
                        <td className="p-1 border border-slate-300 font-mono">{g.student.nim}</td>
                        <td className="p-1 border border-slate-300 font-semibold">{g.student.nama}</td>
                        <td className="p-1 text-center border border-slate-300">{g.kehadiranScore}</td>
                        <td className="p-1 text-center border border-slate-300">{g.tugas}</td>
                        <td className="p-1 text-center border border-slate-300">{g.kuis}</td>
                        <td className="p-1 text-center border border-slate-300">{g.uts}</td>
                        <td className="p-1 text-center border border-slate-300">{g.uas}</td>
                        <td className="p-1 text-center border border-slate-300 font-bold">{g.nilaiAkhir.toFixed(1)}</td>
                        <td className="p-1 text-center border border-slate-300 font-bold">{g.hurufMutu}</td>
                        <td className="p-1 text-center border border-slate-300 font-mono">{g.angkaMutu.toFixed(2)}</td>
                        <td className="p-1 text-center border border-slate-300 font-semibold">{g.statusKelulusan}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Report 3: Barred Students Table */}
          {reportType === 'barred' && (
            <div className="overflow-x-auto font-sans space-y-3">
              <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-semibold">
                Berikut adalah daftar mahasiswa yang <strong>TIDAK DIPERKENANKAN MENGIKUTI UJIAN AKHIR SEMESTER (UAS)</strong> karena kehadiran di bawah standar minimal {course.minAttendancePercent}% (alpa melebihi {Math.floor(14 * (1 - course.minAttendancePercent / 100))} kali).
              </p>

              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-rose-100 border-b border-slate-300 font-bold text-rose-900">
                    <th className="p-1.5 text-center border border-slate-300 w-8">No</th>
                    <th className="p-1.5 border border-slate-300">NIM</th>
                    <th className="p-1.5 border border-slate-300">Nama Mahasiswa</th>
                    <th className="p-1.5 text-center border border-slate-300">Hadir</th>
                    <th className="p-1.5 text-center border border-slate-300">Alpa</th>
                    <th className="p-1.5 text-center border border-slate-300">% Kehadiran</th>
                    <th className="p-1.5 text-center border border-slate-300">Status Akademik</th>
                  </tr>
                </thead>
                <tbody>
                  {barredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400">
                        Tidak ada mahasiswa yang dicekal UAS.
                      </td>
                    </tr>
                  ) : (
                    barredStudents.map((s, idx) => (
                      <tr key={s.student.id} className="border-b border-slate-200">
                        <td className="p-1.5 text-center border border-slate-300">{idx + 1}</td>
                        <td className="p-1.5 border border-slate-300 font-mono">{s.student.nim}</td>
                        <td className="p-1.5 border border-slate-300 font-bold">{s.student.nama}</td>
                        <td className="p-1.5 text-center border border-slate-300">{s.hadir} kali</td>
                        <td className="p-1.5 text-center border border-slate-300 font-bold text-rose-700">{s.alpa} kali</td>
                        <td className="p-1.5 text-center border border-slate-300 font-bold text-rose-700">{s.percentage}%</td>
                        <td className="p-1.5 text-center border border-slate-300 font-bold text-rose-800">DICEKAL DARI UAS</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Signatures */}
          <div className="pt-6 flex justify-between font-sans text-xs print-avoid-break">
            <div>
              <p></p>
              <p className="font-semibold"></p>
              <div className="h-16" />
              <p className="font-bold underline"></p>
              <p className="text-[10px] text-slate-500 font-mono"></p>
            </div>

            <div className="text-right">
              <p>Padang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold">Dosen Pengampu Mata Kuliah,</p>
              <div className="h-16" />
              <p className="font-bold underline">{course.dosenPengampu}</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. {course.nipDosen}</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
