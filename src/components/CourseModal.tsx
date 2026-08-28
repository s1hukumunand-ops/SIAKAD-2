import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { BookOpen, Calendar, Clock, Sparkles } from 'lucide-react';
import { 
  SEMESTER_OPTIONS, 
  DEFAULT_ACTIVE_SEMESTER, 
  getDefaultStartDateForSemester, 
  generateDefault14Meetings,
  formatIndoDate
} from '../utils/dateUtils';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: Course) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onAddCourse,
}) => {
  const [kode, setKode] = useState('HKM-');
  const [nama, setNama] = useState('');
  const [sks, setSks] = useState(3);
  const [semester, setSemester] = useState<string>(DEFAULT_ACTIVE_SEMESTER);
  const [kelas, setKelas] = useState('Kelas A');
  const [dosenPengampu, setDosenPengampu] = useState('Prof. Dr. H. Saldi Isra, S.H., M.P.A.');
  const [nipDosen, setNipDosen] = useState('196808201994031002');
  const [ruangan, setRuangan] = useState('Gedung A - Ruang 204');
  const [jadwalHari, setJadwalHari] = useState('Senin');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('10:30');
  const [minAttendancePercent, setMinAttendancePercent] = useState(75);
  
  // Tanggal Mulai Pertemuan 1 (Auto calculated based on Semester & Hari)
  const [startDate, setStartDate] = useState(() => getDefaultStartDateForSemester('Senin', DEFAULT_ACTIVE_SEMESTER));

  // Update starting date when semester or day changes
  useEffect(() => {
    const calculated = getDefaultStartDateForSemester(jadwalHari, semester);
    setStartDate(calculated);
  }, [jadwalHari, semester]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !kode) return;

    const newId = `crs-${Date.now()}`;
    const generatedMeetings = generateDefault14Meetings(startDate, nama.trim());

    const newCourse: Course = {
      id: newId,
      kode: kode.trim().toUpperCase(),
      nama: nama.trim(),
      sks,
      semester,
      kelas,
      dosenPengampu,
      nipDosen,
      ruangan,
      jadwalHari,
      jamMulai,
      jamSelesai,
      minAttendancePercent,
      gradeWeights: {
        kehadiran: 10,
        tugas: 20,
        kuis: 10,
        uts: 30,
        uas: 30,
      },
      meetings: generatedMeetings,
    };

    onAddCourse(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tambah Mata Kuliah Baru</h3>
              <p className="text-[11px] text-slate-500">Silabus & Jadwal 14 Pertemuan akan di-generate otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Semester Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Semester Akademik *</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SEMESTER_OPTIONS.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode MK *</label>
              <input
                type="text"
                required
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="HKM-301"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Mata Kuliah *</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Hukum Tata Negara & Konstitusi"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bobot SKS</label>
              <input
                type="number"
                min="1"
                max="6"
                value={sks}
                onChange={(e) => setSks(parseInt(e.target.value) || 2)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Kelas A"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min. Absensi (%)</label>
              <input
                type="number"
                min="50"
                max="90"
                value={minAttendancePercent}
                onChange={(e) => setMinAttendancePercent(parseInt(e.target.value) || 75)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosen Pengampu</label>
              <input
                type="text"
                value={dosenPengampu}
                onChange={(e) => setDosenPengampu(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Dosen</label>
              <input
                type="text"
                value={nipDosen}
                onChange={(e) => setNipDosen(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hari Kuliah</label>
              <select
                value={jadwalHari}
                onChange={(e) => setJadwalHari(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ruangan Kuliah</label>
              <input
                type="text"
                value={ruangan}
                onChange={(e) => setRuangan(e.target.value)}
                placeholder="Gedung A - Ruang 204"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tanggal Mulai (P-1) *</span>
                <span className="text-[10px] text-blue-600 font-normal">Otomatis +7 hari</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-blue-50/40 border border-blue-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Schedule Generator Info Box */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Otomatis Masuk ke Jadwal Kuliah & 14 Pertemuan:</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Mata kuliah ini akan langsung otomatis didaftarkan ke <strong>Jadwal Kuliah Mingguan</strong> ({jadwalHari}, {jamMulai} - {jamSelesai}) dan 14 agenda pertemuan mulai <strong>{formatIndoDate(startDate)}</strong> tanpa perlu tambah jadwal manual lagi.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simpan Mata Kuliah & Jadwal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
