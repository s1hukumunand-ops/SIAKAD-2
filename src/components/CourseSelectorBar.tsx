import React, { useState, useMemo } from 'react';
import { Course, Student, StudentAttendanceMap } from '../types';
import { getCourseStudents } from '../utils/calculations';
import { 
  Search, 
  BookOpen, 
  Check, 
  Plus, 
  Star, 
  Filter, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Layers, 
  LayoutGrid, 
  List, 
  Sparkles,
  Command,
  ChevronDown,
  X
} from 'lucide-react';

export interface GroupedCourse {
  baseKey: string;
  kode: string;
  nama: string;
  sks: number;
  semester: string;
  classes: Course[];
}

interface CourseSelectorBarProps {
  courses: Course[];
  activeCourse: Course | null;
  activeSemester: string;
  students?: Student[];
  attendanceMap?: StudentAttendanceMap;
  pinnedCourseIds: string[];
  onTogglePinCourse: (courseId: string) => void;
  onSelectCourse: (courseId: string) => void;
  onOpenAddCourse?: () => void;
  onOpenSearchModal: () => void;
  titlePrefix?: string;
}

export const CourseSelectorBar: React.FC<CourseSelectorBarProps> = ({
  courses,
  activeCourse,
  activeSemester,
  students = [],
  attendanceMap = {},
  pinnedCourseIds,
  onTogglePinCourse,
  onSelectCourse,
  onOpenAddCourse,
  onOpenSearchModal,
  titlePrefix = 'Pilih Mata Kuliah',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'compact' | 'dropdown'>('grouped');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [selectedLecturerFilter, setSelectedLecturerFilter] = useState<string>('all');
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);

  // 1. Filter courses by active semester
  const semesterCourses = useMemo(() => {
    if (!activeSemester || activeSemester === 'Semua Semester') return courses;
    return courses.filter((c) => c.semester === activeSemester);
  }, [courses, activeSemester]);

  // Extract unique lecturers and days for filters
  const availableLecturers = useMemo(() => {
    const set = new Set<string>();
    semesterCourses.forEach((c) => {
      if (c.dosenPengampu) set.add(c.dosenPengampu.trim());
    });
    return Array.from(set).sort();
  }, [semesterCourses]);

  const availableDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // 2. Apply in-bar search, day, lecturer, and pinned filters
  const filteredCourses = useMemo(() => {
    return semesterCourses.filter((c) => {
      if (showOnlyPinned && !pinnedCourseIds.includes(c.id)) {
        return false;
      }
      if (selectedDayFilter !== 'all' && c.jadwalHari !== selectedDayFilter) {
        return false;
      }
      if (selectedLecturerFilter !== 'all' && c.dosenPengampu !== selectedLecturerFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.nama.toLowerCase().includes(q);
        const matchKode = c.kode.toLowerCase().includes(q);
        const matchKelas = c.kelas.toLowerCase().includes(q);
        const matchDosen = c.dosenPengampu.toLowerCase().includes(q);
        const matchRuang = c.ruangan.toLowerCase().includes(q);
        if (!matchName && !matchKode && !matchKelas && !matchDosen && !matchRuang) {
          return false;
        }
      }
      return true;
    });
  }, [semesterCourses, showOnlyPinned, pinnedCourseIds, selectedDayFilter, selectedLecturerFilter, searchQuery]);

  // 3. Group parallel classes by Course Code + Name for clean parent-child view
  const groupedCourses = useMemo(() => {
    const groupsMap = new Map<string, GroupedCourse>();

    filteredCourses.forEach((c) => {
      // Normalize base course name / code (e.g. HKM101)
      const baseKey = `${c.kode.trim().toUpperCase()}-${c.nama.trim().toLowerCase()}`;
      if (!groupsMap.has(baseKey)) {
        groupsMap.set(baseKey, {
          baseKey,
          kode: c.kode,
          nama: c.nama,
          sks: c.sks,
          semester: c.semester,
          classes: [],
        });
      }
      groupsMap.get(baseKey)!.classes.push(c);
    });

    return Array.from(groupsMap.values()).map((group) => {
      // Sort classes inside group naturally (Kelas A, Kelas B, etc.)
      group.classes.sort((a, b) => a.kelas.localeCompare(b.kelas, undefined, { numeric: true }));
      return group;
    });
  }, [filteredCourses]);

  // Pinned courses list for quick pinned chips
  const pinnedCoursesList = useMemo(() => {
    return courses.filter((c) => pinnedCourseIds.includes(c.id));
  }, [courses, pinnedCourseIds]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedDayFilter !== 'all' || selectedLecturerFilter !== 'all' || showOnlyPinned;

  return (
    <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs">
      
      {/* Top Header & Search / Explorer Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Title & Quick Stats */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                {titlePrefix} ({activeSemester}):
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {filteredCourses.length} Kelas {filteredCourses.length !== semesterCourses.length ? `(dari ${semesterCourses.length})` : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {groupedCourses.length} Mata Kuliah Induk dengan kelas paralel terorganisir
            </p>
          </div>
        </div>

        {/* Right: Search Input, Explorer Modal Trigger & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Real-Time Search in Bar */}
          <div className="relative min-w-[170px] sm:min-w-[210px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari MK, Kode, Dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Full Command Palette / 400+ Course Explorer Button */}
          <button
            id="open-course-explorer-btn"
            onClick={onOpenSearchModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition"
            title="Buka dialog pencarian lengkap 400+ mata kuliah (Shortcut: Ctrl + K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Jelajah 400+ MK</span>
            <kbd className="hidden sm:inline-block bg-blue-700/80 text-blue-100 text-[10px] px-1.5 py-0.5 rounded font-mono ml-0.5">
              Ctrl+K
            </kbd>
          </button>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center bg-white border border-slate-200 p-0.5 rounded-xl text-xs text-slate-600 shadow-2xs">
            <button
              onClick={() => setViewMode('grouped')}
              title="Tampilan Grup Kelas Paralel (Rekomendasi untuk 400+ MK)"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grouped'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Tampilan Chip Ringkas"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'compact'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('dropdown')}
              title="Tampilan Dropdown Cepat"
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'dropdown'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Course Button */}
          {onOpenAddCourse && (
            <button
              onClick={onOpenAddCourse}
              className="flex items-center gap-1 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah MK</span>
            </button>
          )}

        </div>
      </div>

      {/* Filter Chips Toolbar (Hari, Dosen, Pinned Only) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/70">
        
        {/* Pinned Filter Toggle */}
        <button
          onClick={() => setShowOnlyPinned(!showOnlyPinned)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
            showOnlyPinned
              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700 border-slate-200'
          }`}
        >
          <Star className={`w-3 h-3 ${showOnlyPinned ? 'fill-white' : 'text-amber-500'}`} />
          <span>Favorit / Di-pin ({pinnedCourseIds.length})</span>
        </button>

        {/* Day Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-xs">
          <Clock className="w-3 h-3 text-slate-400" />
          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="all">Semua Hari</option>
            {availableDays.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {/* Lecturer Filter */}
        {availableLecturers.length > 1 && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-xs max-w-[200px]">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={selectedLecturerFilter}
              onChange={(e) => setSelectedLecturerFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs truncate"
            >
              <option value="all">Semua Dosen ({availableLecturers.length})</option>
              {availableLecturers.map((doc) => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDayFilter('all');
              setSelectedLecturerFilter('all');
              setShowOnlyPinned(false);
            }}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline ml-auto flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Pinned Courses Quick Access Ribbon (if any pinned courses exist) */}
      {pinnedCoursesList.length > 0 && !showOnlyPinned && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-amber-900">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Mata Kuliah Favorit Anda (Akses Cepat):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {pinnedCoursesList.map((c) => {
              const isSelected = activeCourse?.id === c.id;
              return (
                <div
                  key={c.id}
                  className={`inline-flex items-center rounded-lg text-xs transition border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs font-semibold'
                      : 'bg-white text-slate-800 hover:bg-amber-100/60 border-amber-200'
                  }`}
                >
                  <button
                    onClick={() => onSelectCourse(c.id)}
                    className="px-2.5 py-1 flex items-center gap-1.5"
                  >
                    <span className="font-mono text-[10px] opacity-80">{c.kode}</span>
                    <span className="truncate max-w-[140px]">{c.nama}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                      isSelected ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {c.kelas}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePinCourse(c.id);
                    }}
                    title="Hapus dari favorit"
                    className="pr-2 pl-0.5 text-amber-400 hover:text-amber-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Course Display Area */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl p-6 border border-slate-200 text-center text-slate-500 text-xs">
          <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">Tidak ada mata kuliah yang cocok dengan pencarian / filter.</p>
          <p className="text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau reset filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDayFilter('all');
              setSelectedLecturerFilter('all');
              setShowOnlyPinned(false);
            }}
            className="mt-2.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <>
          {/* MODE 1: GROUPED BY PARENT COURSE (RECOMMENDED FOR 400+ MK) */}
          {viewMode === 'grouped' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {groupedCourses.map((group) => {
                const isGroupActive = group.classes.some((c) => c.id === activeCourse?.id);

                return (
                  <div
                    key={group.baseKey}
                    className={`bg-white rounded-xl p-3 border transition-all shadow-2xs flex flex-col justify-between ${
                      isGroupActive
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Parent Course Info */}
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {group.kode}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {group.sks} SKS
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1 leading-snug" title={group.nama}>
                        {group.nama}
                      </h4>
                      
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {group.classes[0]?.dosenPengampu || 'Dosen Pengampu'}
                      </p>
                    </div>

                    {/* Parallel Class Pill Buttons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Pilih Kelas ({group.classes.length}):</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {group.classes.map((cls) => {
                          const isSelected = cls.id === activeCourse?.id;
                          const isPinned = pinnedCourseIds.includes(cls.id);
                          const enrolledCount = getCourseStudents(students, cls, cls.semester).length;

                          return (
                            <div key={cls.id} className="relative group/btn inline-flex">
                              <button
                                onClick={() => onSelectCourse(cls.id)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                    : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                                }`}
                                title={`${cls.kelas} • ${cls.jadwalHari} ${cls.jamMulai}-${cls.jamSelesai} (${cls.ruangan}) • ${enrolledCount} Mhs`}
                              >
                                <span>{cls.kelas}</span>
                                {enrolledCount > 0 && (
                                  <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {enrolledCount}
                                  </span>
                                )}
                                {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                              </button>

                              {/* Quick Pin Toggle on hover */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTogglePinCourse(cls.id);
                                }}
                                title={isPinned ? 'Hapus Pin Favorit' : 'Pin ke Favorit'}
                                className={`ml-0.5 p-1 rounded hover:bg-slate-200 transition ${
                                  isPinned ? 'text-amber-500' : 'text-slate-300 opacity-0 group-hover/btn:opacity-100'
                                }`}
                              >
                                <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-500' : ''}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: COMPACT CHIPS */}
          {viewMode === 'compact' && (
            <div className="flex flex-wrap items-center gap-1.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredCourses.map((c) => {
                const isSelected = c.id === activeCourse?.id;
                const isPinned = pinnedCourseIds.includes(c.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCourse(c.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 border shadow-2xs ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 font-semibold shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80">{c.kode}</span>
                    <span className="truncate max-w-[160px]">{c.nama}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.kelas}
                    </span>
                    {isPinned && <Star className={`w-3 h-3 ${isSelected ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />}
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* MODE 3: QUICK DROPDOWN */}
          {viewMode === 'dropdown' && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-bold text-slate-700 shrink-0">Pilih dari Daftar Lengkap:</span>
              <select
                value={activeCourse?.id || ''}
                onChange={(e) => onSelectCourse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.kode}] {c.nama} - {c.kelas} ({c.jadwalHari} {c.jamMulai}-{c.jamSelesai} | {c.dosenPengampu})
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {/* Active Course Banner Status Summary Bar */}
      {activeCourse && (
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeCourse.nama}</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                {activeCourse.kelas}
              </span>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>{activeCourse.dosenPengampu}</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>{activeCourse.jadwalHari}, {activeCourse.jamMulai}-{activeCourse.jamSelesai} ({activeCourse.ruangan})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePinCourse(activeCourse.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                pinnedCourseIds.includes(activeCourse.id)
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
              }`}
              title="Pin mata kuliah ini ke daftar favorit untuk akses instan"
            >
              <Star className={`w-3 h-3 ${pinnedCourseIds.includes(activeCourse.id) ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>{pinnedCourseIds.includes(activeCourse.id) ? 'Favorit' : 'Pin Favorit'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
