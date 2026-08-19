import React, { useState } from 'react';
import { Course, Student, StudentAttendanceMap, StudentGrade } from '../types';
import { calculateAttendanceSummary, calculateGrade } from '../utils/calculations';
import { 
  FileSpreadsheet, 
  Settings2, 
  Search, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Download, 
  Sparkles,
  HelpCircle,
  Calculator
} from 'lucide-react';

interface GradesTabProps {
  course: Course;
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  grades: Record<string, Record<string, StudentGrade>>;
  onUpdateGrade: (studentId: string, updatedField: Partial<StudentGrade>) => void;
  onUpdateWeights: (weights: Course['gradeWeights']) => void;
  onOpenReportModal: () => void;
}

export const GradesTab: React.FC<GradesTabProps> = ({
  course,
  students,
  attendanceMap,
  grades,
  onUpdateGrade,
  onUpdateWeights,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [tempWeights, setTempWeights] = useState(course.gradeWeights);

  const courseAttendance = attendanceMap[course.id] || {};
  const courseGrades = grades[course.id] || {};

  // Compute grades for all students
  const calculatedList = students.map((std) => {
    const summary = calculateAttendanceSummary(std, course, courseAttendance[std.id]);
    const gradeRecord = courseGrades[std.id] || {
      studentId: std.id,
      courseId: course.id,
      tugas: 0,
      kuis: 0,
      uts: 0,
      uas: 0,
    };

    const calculated = calculateGrade(std, course, gradeRecord, summary);
    return {
      student: std,
      summary,
      gradeRecord,
      calculated,
    };
  });

  const filteredList = calculatedList.filter(({ student }) => 
    student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nim.includes(searchQuery)
  );

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeights(tempWeights);
    setShowWeightModal(false);
  };

  const totalWeight =
    (tempWeights.kehadiran || 0) +
    (tempWeights.tugas || 0) +
    (tempWeights.kuis || 0) +
    (tempWeights.uts || 0) +
    (tempWeights.uas || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Input Nilai & Penentuan Huruf Mutu
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {course.nama} ({course.sks} SKS)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nilai Akhir dan Huruf Mutu (A, B, C, D, E) dikalkulasikan secara otomatis berdasarkan formula bobot dan kehadiran 14 pertemuan.
          </p>
        </div>

        {/* Weights Button & Report Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="open-weights-config-btn"
            onClick={() => {
              setTempWeights(course.gradeWeights);
              setShowWeightModal(true);
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition border border-slate-200 shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Atur Bobot Penilaian</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cetak DPNA</span>
          </button>
        </div>
      </div>

      {/* Current Weights Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200">Bobot Komponen Aktif:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            Kehadiran: <strong className="text-blue-400">{course.gradeWeights.kehadiran}%</strong>
          </span>
          <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            Tugas: <strong className="text-emerald-400">{course.gradeWeights.tugas}%</strong>
          </span>
          <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            Kuis: <strong className="text-amber-400">{course.gradeWeights.kuis}%</strong>
          </span>
          <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            UTS: <strong className="text-indigo-400">{course.gradeWeights.uts}%</strong>
          </span>
          <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
            UAS: <strong className="text-purple-400">{course.gradeWeights.uas}%</strong>
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
            Total 100%
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="search-grade-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan NIM atau Nama Mahasiswa..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
        />
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-3 text-center w-10 sticky left-0 z-20 bg-slate-900">
                  No
                </th>
                <th className="py-3 px-3 sticky left-10 z-20 bg-slate-900 min-w-[200px]">
                  Mahasiswa
                </th>
                <th className="py-3 px-3 text-center min-w-[90px] border-l border-slate-800">
                  Kehadiran ({course.gradeWeights.kehadiran}%)
                </th>
                <th className="py-3 px-3 text-center min-w-[85px] border-l border-slate-800">
                  Tugas ({course.gradeWeights.tugas}%)
                </th>
                <th className="py-3 px-3 text-center min-w-[85px] border-l border-slate-800">
                  Kuis ({course.gradeWeights.kuis}%)
                </th>
                <th className="py-3 px-3 text-center min-w-[85px] border-l border-slate-800">
                  UTS ({course.gradeWeights.uts}%)
                </th>
                <th className="py-3 px-3 text-center min-w-[85px] border-l border-slate-800">
                  UAS ({course.gradeWeights.uas}%)
                </th>
                <th className="py-3 px-3 text-center min-w-[90px] border-l border-slate-800 bg-slate-950/80">
                  Nilai Akhir
                </th>
                <th className="py-3 px-3 text-center min-w-[80px] border-l border-slate-800 bg-slate-950/80">
                  Huruf Mutu
                </th>
                <th className="py-3 px-3 text-center min-w-[70px] border-l border-slate-800 bg-slate-950/80">
                  Bobot
                </th>
                <th className="py-3 px-3 text-center min-w-[110px] border-l border-slate-800 bg-slate-950/80">
                  Status
                </th>
                <th className="py-3 px-3 min-w-[150px] border-l border-slate-800">
                  Catatan Dosen
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada mahasiswa yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredList.map(({ student, summary, gradeRecord, calculated }, idx) => {
                  const isBarred = !summary.isEligibleForExam;

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50/80 transition ${
                        isBarred ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono sticky left-0 bg-white z-10">
                        {idx + 1}
                      </td>

                      {/* Mahasiswa Info */}
                      <td className="py-2.5 px-3 sticky left-10 bg-white z-10 border-r border-slate-100">
                        <div className="font-semibold text-slate-900 text-xs truncate max-w-[190px]">
                          {student.nama}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student.nim}
                        </div>
                      </td>

                      {/* Kehadiran (Synced from 14 meetings) */}
                      <td className="py-2 px-3 text-center border-l border-slate-100">
                        <div className="font-bold text-slate-800 font-mono text-xs">
                          {summary.percentage}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {summary.hadir}/14 Sesi
                        </span>
                      </td>

                      {/* Tugas Input */}
                      <td className="py-2 px-2 text-center border-l border-slate-100">
                        <input
                          id={`input-tugas-${student.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={gradeRecord.tugas || ''}
                          onChange={(e) =>
                            onUpdateGrade(student.id, { tugas: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 py-1 px-1.5 text-center text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                      </td>

                      {/* Kuis Input */}
                      <td className="py-2 px-2 text-center border-l border-slate-100">
                        <input
                          id={`input-kuis-${student.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={gradeRecord.kuis || ''}
                          onChange={(e) =>
                            onUpdateGrade(student.id, { kuis: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 py-1 px-1.5 text-center text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                      </td>

                      {/* UTS Input */}
                      <td className="py-2 px-2 text-center border-l border-slate-100">
                        <input
                          id={`input-uts-${student.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={gradeRecord.uts || ''}
                          onChange={(e) =>
                            onUpdateGrade(student.id, { uts: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 py-1 px-1.5 text-center text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                      </td>

                      {/* UAS Input (Disabled if barred from UAS) */}
                      <td className="py-2 px-2 text-center border-l border-slate-100">
                        <input
                          id={`input-uas-${student.id}`}
                          type="number"
                          min="0"
                          max="100"
                          disabled={isBarred}
                          value={isBarred ? 0 : (gradeRecord.uas || '')}
                          onChange={(e) =>
                            onUpdateGrade(student.id, { uas: parseFloat(e.target.value) || 0 })
                          }
                          title={isBarred ? 'Mahasiswa dicekal dari UAS karena absensi < 75%' : ''}
                          className={`w-16 py-1 px-1.5 text-center text-xs font-semibold rounded-lg border transition ${
                            isBarred
                              ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-not-allowed'
                              : 'bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white'
                          }`}
                        />
                      </td>

                      {/* Nilai Akhir */}
                      <td className="py-2 px-3 text-center font-bold text-slate-900 border-l border-slate-200 bg-slate-50/40 text-xs font-mono">
                        {calculated.nilaiAkhir.toFixed(1)}
                      </td>

                      {/* Huruf Mutu */}
                      <td className="py-2 px-3 text-center border-l border-slate-200 font-bold">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                            calculated.hurufMutu === 'A' || calculated.hurufMutu === 'A-'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : calculated.hurufMutu === 'B+' || calculated.hurufMutu === 'B' || calculated.hurufMutu === 'B-'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : calculated.hurufMutu === 'C+' || calculated.hurufMutu === 'C'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {calculated.hurufMutu}
                        </span>
                      </td>

                      {/* Bobot Mutu */}
                      <td className="py-2 px-3 text-center text-slate-600 border-l border-slate-200 font-mono text-xs">
                        {calculated.angkaMutu.toFixed(2)}
                      </td>

                      {/* Status Kelulusan */}
                      <td className="py-2 px-3 text-center border-l border-slate-200">
                        {calculated.statusKelulusan === 'LULUS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            LULUS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {isBarred ? 'DICEKAL UAS' : 'TIDAK LULUS'}
                          </span>
                        )}
                      </td>

                      {/* Catatan Input */}
                      <td className="py-2 px-3 border-l border-slate-200">
                        <input
                          id={`input-catatan-${student.id}`}
                          type="text"
                          value={gradeRecord.catatan || ''}
                          onChange={(e) =>
                            onUpdateGrade(student.id, { catatan: e.target.value })
                          }
                          placeholder="Catatan perkembangan..."
                          className="w-full py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white text-slate-700"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Scale Reference Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-2">
          Standar Konversi Nilai & Huruf Mutu Perguruan Tinggi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="font-bold text-emerald-800 text-sm">A</span>
            <p className="text-slate-600 text-[10px]">&ge; 85 (4.00)</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="font-bold text-emerald-800 text-sm">A-</span>
            <p className="text-slate-600 text-[10px]">80 - 84 (3.75)</p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <span className="font-bold text-blue-800 text-sm">B+</span>
            <p className="text-slate-600 text-[10px]">75 - 79 (3.50)</p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <span className="font-bold text-blue-800 text-sm">B</span>
            <p className="text-slate-600 text-[10px]">70 - 74 (3.00)</p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <span className="font-bold text-blue-800 text-sm">B-</span>
            <p className="text-slate-600 text-[10px]">65 - 69 (2.75)</p>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="font-bold text-amber-800 text-sm">C+</span>
            <p className="text-slate-600 text-[10px]">60 - 64 (2.25)</p>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="font-bold text-amber-800 text-sm">C</span>
            <p className="text-slate-600 text-[10px]">55 - 59 (2.00)</p>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <span className="font-bold text-rose-800 text-sm">D</span>
            <p className="text-slate-600 text-[10px]">45 - 54 (1.00)</p>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <span className="font-bold text-rose-800 text-sm">E</span>
            <p className="text-slate-600 text-[10px]">&lt; 45 (0.00)</p>
          </div>
        </div>
      </div>

      {/* Weight Customizer Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Atur Bobot Penilaian</h3>
              </div>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Sesuaikan proporsi persentase setiap komponen nilai. Total bobot harus berjumlah <strong>100%</strong>.
            </p>

            <form onSubmit={handleSaveWeights} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700">1. Kehadiran (14 Sesi)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tempWeights.kehadiran}
                    onChange={(e) =>
                      setTempWeights({ ...tempWeights, kehadiran: parseInt(e.target.value) || 0 })
                    }
                    className="w-16 p-1.5 text-center font-bold bg-white border border-slate-300 rounded-lg"
                  />
                  <span className="font-semibold text-slate-600">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700">2. Tugas Mandiri & Terstruktur</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tempWeights.tugas}
                    onChange={(e) =>
                      setTempWeights({ ...tempWeights, tugas: parseInt(e.target.value) || 0 })
                    }
                    className="w-16 p-1.5 text-center font-bold bg-white border border-slate-300 rounded-lg"
                  />
                  <span className="font-semibold text-slate-600">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700">3. Kuis & Partisipasi</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tempWeights.kuis}
                    onChange={(e) =>
                      setTempWeights({ ...tempWeights, kuis: parseInt(e.target.value) || 0 })
                    }
                    className="w-16 p-1.5 text-center font-bold bg-white border border-slate-300 rounded-lg"
                  />
                  <span className="font-semibold text-slate-600">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700">4. Ujian Tengah Semester (UTS)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tempWeights.uts}
                    onChange={(e) =>
                      setTempWeights({ ...tempWeights, uts: parseInt(e.target.value) || 0 })
                    }
                    className="w-16 p-1.5 text-center font-bold bg-white border border-slate-300 rounded-lg"
                  />
                  <span className="font-semibold text-slate-600">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700">5. Ujian Akhir Semester (UAS)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tempWeights.uas}
                    onChange={(e) =>
                      setTempWeights({ ...tempWeights, uas: parseInt(e.target.value) || 0 })
                    }
                    className="w-16 p-1.5 text-center font-bold bg-white border border-slate-300 rounded-lg"
                  />
                  <span className="font-semibold text-slate-600">%</span>
                </div>
              </div>

              {/* Total indicator */}
              <div className={`p-3 rounded-xl flex items-center justify-between font-bold ${
                totalWeight === 100 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <span>Total Bobot:</span>
                <span>{totalWeight}% {totalWeight === 100 ? '✅ Pas 100%' : '⚠️ Harus 100%'}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={totalWeight !== 100}
                  className={`px-4 py-2 rounded-xl text-white font-semibold shadow-sm ${
                    totalWeight === 100 ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer' : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  Simpan Formula Bobot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
