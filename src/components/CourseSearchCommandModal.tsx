import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Course, Student, StudentAttendanceMap } from '../types';
import { getCourseStudents, calculateAttendanceSummary } from '../utils/calculations';
import { 
  Search, 
  X, 
  BookOpen, 
  Star, 
  Clock, 
  MapPin, 
  User, 
  Check, 
  CalendarCheck, 
  FileSpreadsheet, 
  Layers, 
  ArrowRight, 
  Filter,
  Plus,
  Command
} from 'lucide-react';

interface CourseSearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  activeCourseId: string;
  activeSemester: string;
  students: Student[];
  attendanceMap: StudentAttendanceMap;
  pinnedCourseIds: string[];
  onTogglePinCourse: (courseId: string) => void;
  onSelectCourse: (courseId: string) => void;
  onNavigateTab?: (tab: 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report') => void;
  onOpenAddCourse?: () => void;
}

export const CourseSearchCommandModal: React.FC<CourseSearchCommandModalProps> = ({
  isOpen,
  onClose,
  courses,
  activeCourseId,
  activeSemester,
  students,
  attendanceMap,
  pinnedCourseIds,
  onTogglePinCourse,
  onSelectCourse,
  onNavigateTab,
  onOpenAddCourse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>(activeSemester || 'all');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedSksFilter, setSelectedSksFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Semesters list
  const allSemesters = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.semester) set.add(c.semester);
    });
    return Array.from(set);
  }, [courses]);

  // Days list
  const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Filtered & Ranked Courses
  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return courses.filter((c) => {
      // Semester filter
      if (selectedSemesterFilter !== 'all' && c.semester !== selectedSemesterFilter) {
        return false;
      }
      // Day filter
      if (selectedDayFilter !== 'all' && c.jadwalHari !== selectedDayFilter) {
        return false;
      }
      // SKS filter
      if (selectedSksFilter !== 'all' && String(c.sks) !== selectedSksFilter) {
        return false;
      }

      // Search match
      if (query) {
        const matchName = c.nama.toLowerCase().includes(query);
        const matchKode = c.kode.toLowerCase().includes(query);
        const matchKelas = c.kelas.toLowerCase().includes(query);
        const matchDosen = c.dosenPengampu.toLowerCase().includes(query);
        const matchRuangan = c.ruangan.toLowerCase().includes(query);
        return matchName || matchKode || matchKelas || matchDosen || matchRuangan;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize pinned courses to the top
      const aPinned = pinnedCourseIds.includes(a.id);
      const bPinned = pinnedCourseIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // Then sort by course code and class
      if (a.kode === b.kode) {
        return a.kelas.localeCompare(b.kelas, undefined, { numeric: true });
      }
      return a.kode.localeCompare(b.kode);
    });
  }, [courses, searchQuery, selectedSemesterFilter, selectedDayFilter, selectedSksFilter, pinnedCourseIds]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCourses.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCourses[selectedIndex]) {
        handleSelectCourse(filteredCourses[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectCourse = (courseId: string) => {
    onSelectCourse(courseId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 z-50 animate-in fade-in overflow-y-auto pt-10 sm:pt-16">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative z-10 max-h-[85vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari dari 400+ mata kuliah (Ketik Nama MK, Kode, Kelas, Dosen, atau Ruangan)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono border border-slate-300">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Badges Strip */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>

          {/* Semester Filter */}
          <select
            value={selectedSemesterFilter}
            onChange={(e) => {
              setSelectedSemesterFilter(e.target.value);
              setSelectedIndex(0);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded-lg border border-slate-200 focus:outline-none text-xs cursor-pointer"
          >
            <option value="all">Semua Semester ({courses.length} MK)</option>
            {allSemesters.map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>

          {/* Hari Filter */}
          <select
            value={selectedDayFilter}
            onChange={(e) => {
              setSelectedDayFilter(e.target.value);
              setSelectedIndex(0);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded-lg border border-slate-200 focus:outline-none text-xs cursor-pointer"
          >
            <option value="all">Semua Hari</option>
            {daysList.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          {/* SKS Filter */}
          <select
            value={selectedSksFilter}
            onChange={(e) => {
              setSelectedSksFilter(e.target.value);
              setSelectedIndex(0);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded-lg border border-slate-200 focus:outline-none text-xs cursor-pointer"
          >
            <option value="all">Semua Bobot SKS</option>
            <option value="2">2 SKS</option>
            <option value="3">3 SKS</option>
            <option value="4">4 SKS</option>
          </select>

          <span className="ml-auto text-[11px] font-medium text-slate-400">
            Ditemukan: <strong className="text-blue-600">{filteredCourses.length}</strong> mata kuliah
          </span>
        </div>

        {/* Results List */}
        <div 
          ref={listContainerRef}
          className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 scrollbar-thin max-h-[55vh]"
        >
          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Tidak ada mata kuliah yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau periksa filter yang aktif.</p>
            </div>
          ) : (
            filteredCourses.map((c, index) => {
              const isSelected = index === selectedIndex;
              const isActiveCurrent = c.id === activeCourseId;
              const isPinned = pinnedCourseIds.includes(c.id);
              const enrolledStudents = getCourseStudents(students, c, c.semester);
              const completedMeetings = c.meetings?.filter((m) => m.isCompleted)?.length || 0;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCourse(c.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 ring-1 ring-blue-500/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  
                  {/* Left Course Details */}
                  <div className="flex items-start gap-3">
                    
                    {/* Star Pin Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinCourse(c.id);
                      }}
                      className={`p-1.5 rounded-lg transition mt-0.5 ${
                        isPinned
                          ? 'text-amber-500 hover:bg-amber-100/50'
                          : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100'
                      }`}
                      title={isPinned ? 'Hapus dari favorit' : 'Pin ke favorit'}
                    >
                      <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-500' : ''}`} />
                    </button>

                    <div>
                      {/* Code, Name & Class badge */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          {c.kode}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {c.nama}
                        </h4>
                        <span className="bg-slate-800 text-white font-semibold text-xs px-2 py-0.5 rounded-md">
                          {c.kelas}
                        </span>
                        {isActiveCurrent && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            Sedang Dibuka
                          </span>
                        )}
                      </div>

                      {/* Meta info: Lecturer, Time, Room, SKS, Semester */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-700">{c.dosenPengampu || 'Dosen Pengampu'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{c.jadwalHari}, {c.jamMulai} - {c.jamSelesai}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.ruangan}</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{c.sks} SKS</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{c.semester}</span>
                      </div>
                    </div>

                  </div>

                  {/* Right: Quick Action Controls & Stats */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pl-8 sm:pl-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-800">
                        {enrolledStudents.length} Mahasiswa
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {completedMeetings}/14 Pertemuan
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCourse(c.id);
                        if (onNavigateTab) onNavigateTab('attendance');
                      }}
                      title="Buka Presensi 14 Pertemuan"
                      className="p-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 transition shadow-2xs text-xs font-semibold flex items-center gap-1"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Presensi</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCourse(c.id);
                        if (onNavigateTab) onNavigateTab('grades');
                      }}
                      title="Buka Rekap Nilai"
                      className="p-2 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 transition shadow-2xs text-xs font-semibold flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Nilai</span>
                    </button>

                    <button
                      onClick={() => handleSelectCourse(c.id)}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs text-xs font-semibold flex items-center"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]">↑</kbd>
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]">↓</kbd>
              <span>Navigasi</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]">ENTER</kbd>
              <span>Pilih MK</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddCourse && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddCourse();
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Mata Kuliah Baru</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
