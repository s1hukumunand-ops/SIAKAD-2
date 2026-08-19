import React, { useState } from 'react';
import { Course, Student, StudentAttendanceMap, StudentGrade } from '../types';
import { calculateAttendanceSummary, calculateGrade } from '../utils/calculations';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  X, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  grades: Record<string, Record<string, StudentGrade>>;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  course,
  students,
  attendanceMap,
  grades,
}) => {
  const [reportType, setReportType] = useState<'attendance' | 'grades' | 'barred'>('attendance');

  if (!isOpen) return null;

  const courseAttendance = attendanceMap[course.id] || {};
  const courseGrades = grades[course.id] || {};

  const summaries = students.map((std) => 
    calculateAttendanceSummary(std, course, courseAttendance[std.id])
  );

  const calculatedGrades = students.map((std) => {
    const summary = summaries.find((s) => s.student.id === std.id)!;
    return calculateGrade(std, course, courseGrades[std.id], summary);
  });

  const barredStudents = summaries.filter((s) => !s.isEligibleForExam);

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
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
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 border border-slate-200 rounded-xl my-4 text-xs font-serif text-slate-900 space-y-4 print:p-0 print:border-none print:bg-white">
          
          {/* Header Kop Surat */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider">KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI</h3>
            <h2 className="text-base font-black uppercase">UNIVERSITAS NEGERI INDONESIA</h2>
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
            <p className="text-[11px] text-slate-600 mt-0.5">{course.semester}</p>
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
                  {summaries.map((s, idx) => (
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
                  ))}
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
                  {calculatedGrades.map((g, idx) => (
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
                  ))}
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
          <div className="pt-6 flex justify-between font-sans text-xs">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Ketua Jurusan / Program Studi</p>
              <div className="h-16" />
              <p className="font-bold underline">Dr. Kurnia Warman, S.H., M.Hum.</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. 197205151998021001</p>
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
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0">
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
