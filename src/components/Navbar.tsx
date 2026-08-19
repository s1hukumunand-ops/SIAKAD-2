import React from 'react';
import { Course } from '../types';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarCheck, 
  FileSpreadsheet, 
  CalendarDays, 
  AlertTriangle, 
  Cloud, 
  Printer, 
  Plus, 
  BookOpen,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  activeTab: 'dashboard' | 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report';
  setActiveTab: (tab: 'dashboard' | 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report') => void;
  warningCount: number;
  onOpenAddCourse: () => void;
  onOpenAddStudent: () => void;
  isSyncing: boolean;
  onQuickSync: () => void;
  googleSheetConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  activeTab,
  setActiveTab,
  warningCount,
  onOpenAddCourse,
  onOpenAddStudent,
  isSyncing,
  onQuickSync,
  googleSheetConnected,
}) => {
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Absensi 14 Pertemuan', icon: CalendarCheck },
    { id: 'grades', label: 'Input Nilai & Mutu', icon: FileSpreadsheet },
    { id: 'schedule', label: 'Jadwal Kuliah', icon: CalendarDays },
    { 
      id: 'warning', 
      label: 'Peringatan Absensi (<75%)', 
      icon: AlertTriangle, 
      badge: warningCount > 0 ? warningCount : null 
    },
    { 
      id: 'googlesheets', 
      label: 'Google Sheets API', 
      icon: Cloud, 
      isLive: googleSheetConnected 
    },
    { id: 'report', label: 'Cetak Laporan', icon: Printer },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight leading-none">
                  SIAKAD Rekap Perkuliahan
                </h1>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30 font-medium">
                  v2.5 Apps Script API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manajemen Absensi 14 Pertemuan, Penilaian & Sistem Peringatan Otomatis
              </p>
            </div>
          </div>

          {/* Course Selector & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Course Selector */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700">
              <BookOpen className="w-4 h-4 text-blue-400 ml-2" />
              <select
                id="course-selector-dropdown"
                value={selectedCourseId}
                onChange={(e) => onSelectCourse(e.target.value)}
                className="bg-transparent text-sm text-slate-100 px-2 py-1.5 focus:outline-none cursor-pointer font-medium max-w-[220px] truncate"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id} className="bg-slate-900 text-white">
                    {course.kode} - {course.nama} ({course.kelas})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Sync Button */}
            <button
              id="quick-sync-btn"
              onClick={onQuickSync}
              disabled={isSyncing}
              title="Sinkronisasi ke Google Sheets API"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Sinkron...' : 'Sync Sheets'}
              </span>
              {googleSheetConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Google Sheets Terhubung" />
              )}
            </button>

            {/* Quick Add Student Button */}
            <button
              id="add-student-nav-btn"
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg transition font-medium shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Mhs</span>
            </button>

            {/* Add Course Button */}
            <button
              id="add-course-nav-btn"
              onClick={onOpenAddCourse}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mata Kuliah</span>
            </button>
          </div>

        </div>

        {/* Selected Course Quick Info Ribbon */}
        {currentCourse && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-slate-200 font-semibold">{currentCourse.nama}</span>
              <span>• SKS: <strong className="text-slate-200">{currentCourse.sks} SKS</strong></span>
              <span>• Dosen: <span className="text-slate-300">{currentCourse.dosenPengampu}</span></span>
              <span>• Jadwal: <span className="text-slate-300">{currentCourse.jadwalHari}, {currentCourse.jamMulai}-{currentCourse.jamSelesai}</span></span>
              <span>• Ruang: <span className="text-slate-300">{currentCourse.ruangan}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
                Syarat Kehadiran: {currentCourse.minAttendancePercent}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-slate-900/90 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                
                {item.badge !== null && item.badge !== undefined && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}

                {item.isLive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
