import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types';
import { UserPlus, UserCog, BookOpen, Trash2, AlertCircle } from 'lucide-react';
import { SEMESTER_OPTIONS, DEFAULT_ACTIVE_SEMESTER } from '../utils/dateUtils';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent?: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  studentToEdit?: Student | null;
  courses?: Course[];
  activeCourseId?: string;
  activeSemester?: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  studentToEdit,
  courses = [],
  activeCourseId,
  activeSemester,
}) => {
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [prodi, setProdi] = useState('Ilmu Hukum');
  const [angkatan, setAngkatan] = useState('2021');
  const [noHp, setNoHp] = useState('08');
  const [email, setEmail] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [semester, setSemester] = useState(DEFAULT_ACTIVE_SEMESTER);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!studentToEdit;

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      return;
    }

    if (studentToEdit) {
      setNim(studentToEdit.nim || '');
      setNama(studentToEdit.nama || '');
      setProdi(studentToEdit.prodi || 'Ilmu Hukum');
      setAngkatan(studentToEdit.angkatan || '2021');
      setNoHp(studentToEdit.noHp || '08');
      setEmail(studentToEdit.email || '');
      setJenisKelamin(studentToEdit.jenisKelamin || 'L');
      setSemester(studentToEdit.semester || activeSemester || DEFAULT_ACTIVE_SEMESTER);
      const initialCourses = Array.isArray(studentToEdit.courseIds) && studentToEdit.courseIds.length > 0
        ? studentToEdit.courseIds
        : (activeCourseId ? [activeCourseId] : []);
      setSelectedCourseIds(initialCourses);
    } else {
      setNim('');
      setNama('');
      setProdi('Ilmu Hukum');
      setAngkatan('2021');
      setNoHp('08');
      setEmail('');
      setJenisKelamin('L');
      const initialSem = activeSemester && activeSemester !== 'Semua Semester'
        ? activeSemester
        : (courses.find(c => c.id === activeCourseId)?.semester || DEFAULT_ACTIVE_SEMESTER);
      setSemester(initialSem);
      setSelectedCourseIds(activeCourseId ? [activeCourseId] : []);
    }
    setShowDeleteConfirm(false);
  }, [isOpen, studentToEdit, activeSemester, activeCourseId]);

  if (!isOpen) return null;

  const filteredCoursesForSemester = semester === 'Semua Semester'
    ? courses
    : courses.filter(c => c.semester === semester);

  const toggleCourse = (cId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(cId) ? prev.filter(id => id !== cId) : [...prev, cId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim || !nama) return;

    const studentPayload = {
      nim: nim.trim(),
      nama: nama.trim(),
      prodi,
      angkatan,
      noHp: noHp.trim(),
      email: email.trim() || `${nim}@student.univ.ac.id`,
      jenisKelamin,
      semester,
      courseIds: selectedCourseIds,
    };

    if (isEditMode && studentToEdit && onUpdateStudent) {
      onUpdateStudent({
        ...studentToEdit,
        ...studentPayload,
      });
    } else if (onAddStudent) {
      onAddStudent(studentPayload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (studentToEdit && onDeleteStudent) {
      onDeleteStudent(studentToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <UserCog className="w-5 h-5 text-amber-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditMode ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h3>
              {isEditMode && (
                <p className="text-[11px] text-slate-500 font-mono">
                  ID: {studentToEdit?.id} • NIM: {studentToEdit?.nim}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Delete confirmation banner */}
        {showDeleteConfirm && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Konfirmasi Hapus Mahasiswa</span>
            </div>
            <p className="text-rose-700">
              Apakah Anda yakin ingin menghapus data mahasiswa <strong>{nama}</strong> ({nim})? Riwayat presensi dan nilai mahasiswa ini akan dihapus dari daftar kelas.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Mahasiswa
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Induk Mahasiswa (NIM) *
            </label>
            <input
              type="text"
              required
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 2110112015"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap Mahasiswa *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Muhammad Ilham Alamsyah"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Semester & Mata Kuliah Enrollment */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Registrasi Semester & Mata Kuliah (KRS)</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester Akademik</label>
              <select
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                }}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Daftarkan ke Mata Kuliah ({filteredCoursesForSemester.length} tersedia):
              </label>
              {filteredCoursesForSemester.length === 0 ? (
                <p className="text-slate-500 italic text-[11px]">Tidak ada mata kuliah pada semester ini.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {filteredCoursesForSemester.map((c) => {
                    const isChecked = selectedCourseIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCourse(c.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          <span className="font-mono text-[11px] text-slate-500">{c.kode}</span>
                          <span className="truncate">{c.nama}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 flex-shrink-0 ml-2">
                          {c.kelas}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Program Studi</label>
              <input
                type="text"
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Angkatan</label>
              <input
                type="text"
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. WhatsApp / HP *
              </label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="08123456789"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Mahasiswa</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@student.univ.ac.id"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isEditMode && onDeleteStudent ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1.5 text-xs transition"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Mahasiswa
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-white font-semibold shadow-sm transition ${
                  isEditMode
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isEditMode ? 'Simpan Perubahan' : 'Simpan Mahasiswa'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

