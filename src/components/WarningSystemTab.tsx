import React, { useState } from 'react';
import { Course, Student, StudentAttendanceMap } from '../types';
import { calculateAttendanceSummary, generateWarningWhatsAppMessage } from '../utils/calculations';
import { 
  AlertTriangle, 
  Send, 
  Sliders, 
  ShieldAlert, 
  UserX, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  MessageSquare,
  Printer,
  Sparkles
} from 'lucide-react';

interface WarningSystemTabProps {
  course: Course;
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  onUpdateMinAttendance: (minPercent: number) => void;
  onOpenReportModal: () => void;
}

export const WarningSystemTab: React.FC<WarningSystemTabProps> = ({
  course,
  students,
  attendanceMap,
  onUpdateMinAttendance,
  onOpenReportModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<Student | null>(null);

  const courseAttendance = attendanceMap[course.id] || {};

  const summaries = students.map((std) => 
    calculateAttendanceSummary(std, course, courseAttendance[std.id])
  );

  const criticalList = summaries.filter((s) => s.status === 'critical');
  const warningList = summaries.filter((s) => s.status === 'warning');
  const safeList = summaries.filter((s) => s.status === 'safe');

  const handleCopyWAMessage = (student: Student, summary: any) => {
    const isCritical = summary.status === 'critical';
    const text = `${isCritical ? '⚠️ *PERINGATAN KRITIS KEHADIRAN KULIAH (PENCEKALAN UAS)*' : '📢 *PERINGATAN REKAP KEHADIRAN KULIAH*'}

Yth. Sdr/i *${student.nama}* (NIM: *${student.nim}*)
Mata Kuliah: *${course.nama}* (${course.kode}) - ${course.kelas}
Dosen Pengampu: ${course.dosenPengampu}

Rekapitulasi Kehadiran (14 Pertemuan):
- Hadir: ${summary.hadir} kali
- Izin: ${summary.izin} kali
- Sakit: ${summary.sakit} kali
- Alpa (Tanpa Keterangan): *${summary.alpa} kali*
- Persentase Kehadiran: *${summary.percentage}%* (Batas Minimal: ${course.minAttendancePercent}%)

${isCritical
  ? `❌ *STATUS: TIDAK MEMENUHI SYARAT KEHADIRAN (DICEKAL UAS)*
Jumlah alpa Anda telah melampaui batas maksimal (${summary.maxAbsenceAllowed} kali). Anda TIDAK DIPERBOLEHKAN mengikuti Ujian Akhir Semester (UAS) kecuali segera mengurus surat rekomendasi ke Dosen Pengampu.`
  : `⚠️ *STATUS: PERINGATAN (SISA ALPA: ${summary.remainingAbsence} KALI)*
Persentase kehadiran Anda mendekati batas minimal. Mohon tidak menambah ketidakhadiran pada pertemuan tersisa.`
}

_SIAKAD Rekap Perkuliahan & Absensi Mahasiswa_`;

    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 rounded-2xl p-6 text-white border border-rose-800/40 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-rose-500/30 text-rose-300 text-xs px-2.5 py-0.5 rounded-full border border-rose-400/30 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Sistem Peringatan Otomatis Akademik
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Monitoring Batas Kehadiran Minimal
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Mendeteksi secara otomatis mahasiswa yang tidak memenuhi ambang batas <strong>{course.minAttendancePercent}%</strong> kehadiran (Maksimal {Math.floor(14 * (1 - course.minAttendancePercent / 100))} kali Alpa dari 14 pertemuan) dan berstatus <strong>Dicekal UAS</strong>.
            </p>
          </div>

          {/* Quick Stat Counter */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-rose-900/60">
            <div className="text-center px-2">
              <span className="text-xl font-bold text-rose-400">{criticalList.length}</span>
              <p className="text-[10px] text-slate-400">Dicekal UAS</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-xl font-bold text-amber-400">{warningList.length}</span>
              <p className="text-[10px] text-slate-400">Peringatan</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-xl font-bold text-emerald-400">{safeList.length}</span>
              <p className="text-[10px] text-slate-400">Aman</p>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Configurator Slider */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Standar Minimal Kehadiran Kuliah</h3>
            <p className="text-xs text-slate-500">
              Ubah ambang batas persentase minimal untuk mata kuliah ini (Baku Nasional: 75% atau 80%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700">Minimal:</span>
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={course.minAttendancePercent}
            onChange={(e) => onUpdateMinAttendance(parseInt(e.target.value))}
            className="w-32 accent-blue-600 cursor-pointer"
          />
          <span className="text-sm font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-mono">
            {course.minAttendancePercent}%
          </span>
          <span className="text-[11px] text-slate-500">
            (Max {Math.floor(14 * (1 - course.minAttendancePercent / 100))}x Alpa)
          </span>
        </div>
      </div>

      {/* CRITICAL STUDENTS LIST (DICEKAL UAS) */}
      <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-rose-950 text-sm">
                Daftar Mahasiswa Terancam Dicekal UAS (&lt; {course.minAttendancePercent}% Kehadiran)
              </h3>
              <p className="text-xs text-rose-700">
                Mahasiswa pada daftar ini memiliki jumlah alpa melebihi toleransi maksimal sehingga sistem otomatis mencekal nilai UAS.
              </p>
            </div>
          </div>

          <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {criticalList.length} Mahasiswa
          </span>
        </div>

        <div className="divide-y divide-rose-100">
          {criticalList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <p className="font-semibold text-slate-700">Semua mahasiswa memenuhi syarat kehadiran minimal!</p>
              <p className="text-slate-400">Tidak ada mahasiswa yang terancam dicekal UAS saat ini.</p>
            </div>
          ) : (
            criticalList.map((cs) => {
              const waUrl = generateWarningWhatsAppMessage(cs.student, course, cs);

              return (
                <div key={cs.student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-rose-50/40 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-rose-200">
                      {cs.student.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{cs.student.nama}</h4>
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">
                          DICEKAL UAS
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        NIM: {cs.student.nim} • No. HP: {cs.student.noHp}
                      </p>

                      {/* Attendance Breakdown Pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                          Hadir: {cs.hadir}x
                        </span>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                          Izin: {cs.izin}x
                        </span>
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                          Sakit: {cs.sakit}x
                        </span>
                        <span className="bg-rose-600 text-white font-bold px-2 py-0.5 rounded-md shadow-2xs">
                          Alpa: {cs.alpa}x (Max {cs.maxAbsenceAllowed}x)
                        </span>
                        <span className="font-bold text-rose-600 ml-1">
                          Persentase: {cs.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyWAMessage(cs.student, cs)}
                      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl transition border border-slate-200 font-medium"
                      title="Salin teks pesan peringatan"
                    >
                      {copiedId === cs.student.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Teks WA</span>
                        </>
                      )}
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-xl font-semibold transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim WA Langsung</span>
                    </a>

                    <button
                      onClick={() => setSelectedStudentForLetter(cs.student)}
                      className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs px-3 py-2 rounded-xl font-semibold transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Lihat Surat SP</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* WARNING STUDENTS LIST (BATAS KRITIS) */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                Daftar Mahasiswa Batas Peringatan / Rawan (Sisa Jatah Alpa &le; 1 Kali)
              </h3>
              <p className="text-xs text-amber-800">
                Mahasiswa ini masih berhak mengikuti UAS, namun jika menambah 1 kali alpa lagi maka akan otomatis dicekal.
              </p>
            </div>
          </div>

          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {warningList.length} Mahasiswa
          </span>
        </div>

        <div className="divide-y divide-amber-100">
          {warningList.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              Tidak ada mahasiswa dalam batas peringatan.
            </div>
          ) : (
            warningList.map((ws) => {
              const waUrl = generateWarningWhatsAppMessage(ws.student, course, ws);

              return (
                <div key={ws.student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/30 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-amber-200">
                      {ws.student.nama.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{ws.student.nama}</h4>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          SISA JATAH ALPA: {ws.remainingAbsence} KALI
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        NIM: {ws.student.nim} • No. HP: {ws.student.noHp}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                          Hadir: {ws.hadir}x
                        </span>
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-300">
                          Alpa: {ws.alpa}x
                        </span>
                        <span className="font-bold text-slate-800">
                          Kehadiran: {ws.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs px-3.5 py-2 rounded-xl font-semibold transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Peringatan WA</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Surat Peringatan (SP) Academic Letter Preview Modal */}
      {selectedStudentForLetter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">Surat Peringatan & Berita Acara Pencekalan UAS</h3>
              </div>
              <button
                onClick={() => setSelectedStudentForLetter(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Official Letter Paper Layout */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-4 font-serif text-slate-900">
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="font-bold text-sm uppercase tracking-wider">KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI</h2>
                <h1 className="font-extrabold text-base uppercase">UNIVERSITAS NEGERI INDONESIA</h1>
                <p className="text-[11px] font-sans text-slate-600">FAKULTAS HUKUM • PROGRAM STUDI S1 ILMU HUKUM</p>
                <p className="text-[10px] font-sans text-slate-500">Kampus Limau Manis, Padang 25163 • Laman: https://unand.ac.id</p>
              </div>

              {/* Letter Title */}
              <div className="text-center pt-2">
                <h3 className="font-bold text-xs uppercase underline">SURAT PERINGATAN KETIDAKHADIRAN KULIAH (SP-1)</h3>
                <p className="text-[11px] font-sans text-slate-500">Nomor: SP/{course.kode}/AKAD/{new Date().getFullYear()}</p>
              </div>

              <p className="leading-relaxed">
                Berdasarkan rekapitulasi presensi perkuliahan 14 pertemuan semester berjalan, bersama ini disampaikan kepada:
              </p>

              {/* Student Detail Table */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-sans space-y-1 text-xs">
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-slate-600">Nama Mahasiswa</span>
                  <span className="col-span-2 font-bold text-slate-900">: {selectedStudentForLetter.nama}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-slate-600">NIM</span>
                  <span className="col-span-2 font-mono text-slate-900">: {selectedStudentForLetter.nim}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-slate-600">Mata Kuliah</span>
                  <span className="col-span-2 text-slate-900">: {course.nama} ({course.kode})</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-slate-600">Dosen Pengampu</span>
                  <span className="col-span-2 text-slate-900">: {course.dosenPengampu}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-semibold text-slate-600">Status Kehadiran</span>
                  <span className="col-span-2 font-bold text-rose-600">
                    : &lt; {course.minAttendancePercent}% (Dinyatakan TIDAK MEMENUHI SYARAT UAS)
                  </span>
                </div>
              </div>

              <p className="leading-relaxed">
                Sehubungan dengan jumlah ketidakhadiran (Alpa) yang telah melampaui batas toleransi maksimal peraturan akademik, maka mahasiswa bersangkutan dinyatakan <strong>DICEKAL DARI UJIAN AKHIR SEMESTER (UAS)</strong> untuk mata kuliah tersebut.
              </p>

              {/* Signature Block */}
              <div className="pt-4 flex justify-between font-sans text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Ketua Program Studi</p>
                  <div className="h-14" />
                  <p className="font-bold underline">Dr. Kurnia Warman, S.H., M.Hum.</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 197205151998021001</p>
                </div>

                <div className="text-right">
                  <p>Padang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold">Dosen Pengampu Mata Kuliah,</p>
                  <div className="h-14" />
                  <p className="font-bold underline">{course.dosenPengampu}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. {course.nipDosen}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudentForLetter(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Surat SP</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
