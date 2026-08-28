import React, { useState, useMemo } from 'react';
import { ScheduleItem, Course } from '../types';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Trash2, 
  Edit, 
  BookOpen, 
  ExternalLink,
  CalendarCheck2,
  Search,
  X
} from 'lucide-react';

interface ScheduleTabProps {
  schedules: ScheduleItem[];
  courses: Course[];
  activeSemester?: string;
  onAddSchedule: (schedule: Omit<ScheduleItem, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onSelectCourse: (courseId: string) => void;
  onNavigateTab: (tab: 'attendance' | 'grades') => void;
  onOpenAddCourse?: () => void;
}

const DAYS: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
  'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  schedules,
  courses,
  activeSemester,
  onAddSchedule,
  onDeleteSchedule,
  onSelectCourse,
  onNavigateTab,
  onOpenAddCourse,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const semesterCourses = useMemo(() => {
    if (!activeSemester || activeSemester === 'Semua Semester') return courses;
    return courses.filter((c) => c.semester === activeSemester);
  }, [courses, activeSemester]);

  // Form State
  const [courseId, setCourseId] = useState(semesterCourses[0]?.id || courses[0]?.id || '');
  const [hari, setHari] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('10:30');
  const [ruangan, setRuangan] = useState('Gedung A - Ruang 204');
  const [kelas, setKelas] = useState('Kelas A');

  // Determine current day in Indonesian for today highlight
  const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = dayNamesIndo[new Date().getDay()];

  // Ensure every course has a schedule display filtered by semester
  const activeSchedulesList = useMemo(() => {
    if (schedules && schedules.length > 0) {
      if (!activeSemester || activeSemester === 'Semua Semester') {
        return schedules;
      }
      return schedules.filter((s) => {
        if (s.semester) return s.semester === activeSemester;
        const matchingCourse = courses.find((c) => c.id === s.courseId);
        return matchingCourse ? matchingCourse.semester === activeSemester : false;
      });
    }

    return semesterCourses.map((c, idx) => ({
      id: `sch-course-${c.id}`,
      courseId: c.id,
      namaMK: c.nama,
      kodeMK: c.kode,
      sks: c.sks,
      semester: c.semester,
      hari: (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(c.jadwalHari) ? c.jadwalHari : 'Senin') as any,
      jamMulai: c.jamMulai || '08:00',
      jamSelesai: c.jamSelesai || '10:30',
      ruangan: c.ruangan || 'Ruang Kuliah',
      dosen: c.dosenPengampu || 'Dosen Pengampu',
      kelas: c.kelas || 'Kelas A',
      warna: ['blue', 'emerald', 'purple', 'amber', 'indigo'][idx % 5],
    }));
  }, [schedules, courses, semesterCourses, activeSemester]);

  // Lecturer options for filter
  const lecturerOptions = useMemo(() => {
    const set = new Set<string>();
    activeSchedulesList.forEach((s) => {
      if (s.dosen) set.add(s.dosen.trim());
    });
    return Array.from(set).sort();
  }, [activeSchedulesList]);

  // Filtered schedules by Day, Search query, and Lecturer
  const filteredSchedules = useMemo(() => {
    return activeSchedulesList.filter((s) => {
      if (selectedDay !== 'all' && s.hari !== selectedDay) return false;
      if (selectedLecturer !== 'all' && s.dosen !== selectedLecturer) return false;
      if (scheduleSearch.trim()) {
        const q = scheduleSearch.toLowerCase();
        const matchName = s.namaMK.toLowerCase().includes(q);
        const matchKode = s.kodeMK.toLowerCase().includes(q);
        const matchDosen = s.dosen.toLowerCase().includes(q);
        const matchRuang = s.ruangan.toLowerCase().includes(q);
        const matchKelas = s.kelas.toLowerCase().includes(q);
        if (!matchName && !matchKode && !matchDosen && !matchRuang && !matchKelas) {
          return false;
        }
      }
      return true;
    });
  }, [activeSchedulesList, selectedDay, selectedLecturer, scheduleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find((c) => c.id === courseId);
    if (!selectedCourse) return;

    onAddSchedule({
      courseId,
      namaMK: selectedCourse.nama,
      kodeMK: selectedCourse.kode,
      sks: selectedCourse.sks,
      semester: selectedCourse.semester || activeSemester,
      hari,
      jamMulai,
      jamSelesai,
      ruangan,
      dosen: selectedCourse.dosenPengampu,
      kelas: kelas || selectedCourse.kelas,
      warna: 'blue',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Jadwal Kuliah Mingguan
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Hari Ini: {currentDayName}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Total {activeSchedulesList.length} Jadwal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar waktu dan ruangan perkuliahan per semester. Klik mata kuliah untuk langsung membuka presensi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onOpenAddCourse && (
            <button
              onClick={onOpenAddCourse}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mata Kuliah & Jadwal</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition border border-slate-200"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Atur Slot Jam Tambahan</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Day Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedDay === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua Hari ({activeSchedulesList.length})
          </button>

          {DAYS.map((day) => {
            const count = activeSchedulesList.filter((s) => s.hari === day).length;
            const isToday = currentDayName === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 border border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedDay === day ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Hari Ini" />
                )}
              </button>
            );
          })}
        </div>

        {/* Schedule Search & Lecturer Filter */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jadwal, ruang, MK..."
              value={scheduleSearch}
              onChange={(e) => setScheduleSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {scheduleSearch && (
              <button
                onClick={() => setScheduleSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {lecturerOptions.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs max-w-[180px]">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <select
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-xs truncate"
              >
                <option value="all">Semua Dosen</option>
                {lecturerOptions.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchedules.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
            Tidak ada jadwal kuliah pada hari yang dipilih.
          </div>
        ) : (
          filteredSchedules.map((item) => {
            const isToday = currentDayName === item.hari;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border transition hover:shadow-md flex flex-col justify-between relative overflow-hidden group ${
                  isToday
                    ? 'border-blue-300 ring-2 ring-blue-500/10'
                    : 'border-slate-200/90'
                }`}
              >
                {isToday && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                    Hari Ini
                  </div>
                )}

                <div>
                  {/* Top Day & SKS badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {item.hari} • {item.kelas}
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {item.sks} SKS
                    </span>
                  </div>

                  {/* Course Name & Code */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
                    {item.namaMK}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {item.kodeMK}
                  </p>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-slate-900">{item.jamMulai} - {item.jamSelesai} WIB</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span>{item.ruangan}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{item.dosen}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onSelectCourse(item.courseId);
                      onNavigateTab('attendance');
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <CalendarCheck2 className="w-3.5 h-3.5" />
                    <span>Buka Presensi</span>
                  </button>

                  <button
                    onClick={() => onDeleteSchedule(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Tambah Jadwal Kuliah Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Kuliah</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.kode} - {c.nama} ({c.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari</label>
                  <select
                    value={hari}
                    onChange={(e) => setHari(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Contoh: Kelas A / Reguler"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ruangan / Laboratorium</label>
                <input
                  type="text"
                  value={ruangan}
                  onChange={(e) => setRuangan(e.target.value)}
                  placeholder="Contoh: Gedung A - Ruang 204"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
