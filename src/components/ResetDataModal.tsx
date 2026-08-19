import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCcw, Sparkles, Check, X, ShieldAlert } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
  onResetAttendanceAndGradesOnly: () => void;
  onRestoreDemoData: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onClearAllData,
  onResetAttendanceAndGradesOnly,
  onRestoreDemoData,
}) => {
  const [confirmMode, setConfirmMode] = useState<'all' | 'attendance_grades' | 'demo' | null>(null);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (confirmMode === 'all') {
      onClearAllData();
    } else if (confirmMode === 'attendance_grades') {
      onResetAttendanceAndGradesOnly();
    } else if (confirmMode === 'demo') {
      onRestoreDemoData();
    }
    setConfirmMode(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Manajemen & Pembersihan Data</h3>
              <p className="text-xs text-slate-500">Mulai input baru dari nol atau kosongkan semester</p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmMode(null);
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Confirmation Screen */}
        {confirmMode ? (
          <div className="py-5 space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-950 mb-1">
                  {confirmMode === 'all' && 'Konfirmasi: Hapus & Kosongkan Semua Data?'}
                  {confirmMode === 'attendance_grades' && 'Konfirmasi: Kosongkan Nilai & Absensi 14 Pertemuan?'}
                  {confirmMode === 'demo' && 'Konfirmasi: Pulihkan Data Contoh / Demo?'}
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {confirmMode === 'all' && 'Semua data mahasiswa, riwayat absensi 14 pertemuan, nilai, dan jadwal saat ini akan dihapus dari aplikasi. Aplikasi akan siap untuk penginputan data baru dari awal.'}
                  {confirmMode === 'attendance_grades' && 'Daftar nama mahasiswa dan mata kuliah akan tetap disimpan, namun seluruh status kehadiran 14 pertemuan dan nilai mahasiswa akan dikosongkan untuk memulai semester baru.'}
                  {confirmMode === 'demo' && 'Data akan digantikan kembali dengan data simulasi (12 mahasiswa, mata kuliah FH, absensi & nilai contoh).'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmMode(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecute}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Ya, Lanjutkan Sekarang</span>
              </button>
            </div>
          </div>
        ) : (
          /* Selection Screen */
          <div className="py-4 space-y-3">
            
            {/* Option 1: Clear All (Fresh Start) */}
            <div
              onClick={() => setConfirmMode('all')}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-950 text-xs sm:text-sm">
                    1. Kosongkan Semua Data (Mulai Input dari Nol)
                  </h4>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full border border-rose-300">
                    Fresh Start
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Menghapus semua data mahasiswa demo, nilai, dan absensi sebelumnya. Anda dapat mulai menginput daftar mahasiswa asli Anda sendiri.
                </p>
              </div>
            </div>

            {/* Option 2: Reset Attendance & Grades Only */}
            <div
              onClick={() => setConfirmMode('attendance_grades')}
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                <RefreshCcw className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                    2. Kosongkan Nilai & Absensi Saja (Semester Baru)
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                    Reset Semester
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Mempertahankan daftar mahasiswa & mata kuliah yang ada, tetapi mengosongkan riwayat presensi 14 pertemuan dan nilai.
                </p>
              </div>
            </div>

            {/* Option 3: Restore Demo Data */}
            <div
              onClick={() => setConfirmMode('demo')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    3. Pulihkan Data Contoh / Demo
                  </h4>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    Contoh Simulasi
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Mengisi kembali dengan data contoh 12 mahasiswa, absensi 14 pertemuan, dan penilaian simulasi.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        {!confirmMode && (
          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Tutup
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
