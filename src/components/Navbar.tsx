import React, { useState } from 'react';
import { AuthUser } from '../types';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarCheck, 
  FileSpreadsheet, 
  CalendarDays, 
  AlertTriangle, 
  Cloud, 
  Printer, 
  CheckCircle2,
  RefreshCw,
  Trash2,
  Search,
  User,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  ArrowLeftRight,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser | null;
  activeTab: 'dashboard' | 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report';
  setActiveTab: (tab: 'dashboard' | 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report') => void;
  warningCount: number;
  onOpenResetData: () => void;
  isSyncing: boolean;
  onQuickSync: () => void;
  googleSheetConnected: boolean;
  onOpenSearchModal?: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  warningCount,
  onOpenResetData,
  isSyncing,
  onQuickSync,
  googleSheetConnected,
  onOpenSearchModal,
  onOpenLoginModal,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Role-based navigation items
  const isDosen = currentUser?.role === 'dosen';
  const isAdmin = currentUser?.role === 'admin' || !currentUser;
  const isMahasiswa = currentUser?.role === 'mahasiswa';

  const navItems = [
    { 
      id: 'dashboard', 
      label: isDosen ? 'Dashboard Dosen' : isMahasiswa ? 'Portal Mahasiswa' : 'Dashboard', 
      icon: LayoutDashboard,
      visible: true 
    },
    { 
      id: 'attendance', 
      label: isMahasiswa ? 'Presensi Saya (14 Pertemuan)' : 'Absensi 14 Pertemuan', 
      icon: CalendarCheck,
      visible: true 
    },
    { 
      id: 'grades', 
      label: isMahasiswa ? 'Nilai & KHS Saya' : 'Input Nilai & Mutu', 
      icon: FileSpreadsheet,
      visible: true 
    },
    { 
      id: 'schedule', 
      label: isMahasiswa ? 'Jadwal Kuliah Saya' : isDosen ? 'Jadwal Mengajar' : 'Jadwal Kuliah', 
      icon: CalendarDays,
      visible: true 
    },
    { 
      id: 'warning', 
      label: 'Peringatan Absensi (<75%)', 
      icon: AlertTriangle, 
      badge: warningCount > 0 ? warningCount : null,
      visible: !isMahasiswa 
    },
    { 
      id: 'googlesheets', 
      label: 'Google Sheets API', 
      icon: Cloud, 
      isLive: googleSheetConnected,
      visible: isAdmin 
    },
    { 
      id: 'report', 
      label: isDosen ? 'Cetak DPNA & Berita Acara' : 'Cetak Laporan', 
      icon: Printer,
      visible: !isMahasiswa 
    },
  ].filter((item) => item.visible);

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800 print:hidden">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight leading-none">
                  SIAKAD Rekap Perkuliahan
                </h1>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-blue-500/30 font-medium whitespace-nowrap">
                  2026/2027
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Absensi 14 Pertemuan, Penilaian Mutu & Rekap Akademik Terpadu
              </p>
            </div>
          </div>

          {/* Right Action Controls: Search, Sync, Role Profile & Switcher */}
          <div className="flex items-center gap-2">
            {/* Quick 400+ Course Search & Command Palette Trigger (Hidden for Mahasiswa) */}
            {!isMahasiswa && onOpenSearchModal && (
              <button
                id="navbar-search-course-btn"
                onClick={onOpenSearchModal}
                title="Cari dari 400+ Mata Kuliah (Shortcut: Ctrl + K)"
                className="flex items-center gap-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white text-xs px-3 py-2 rounded-xl border border-blue-700/60 transition font-semibold shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Cari 400+ MK</span>
                <kbd className="hidden lg:inline-block bg-blue-950/80 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-blue-800">
                  Ctrl+K
                </kbd>
              </button>
            )}

            {/* Quick Sync Button (Only Admin) */}
            {isAdmin && (
              <button
                id="quick-sync-btn"
                onClick={onQuickSync}
                disabled={isSyncing}
                title="Sinkronisasi ke Google Sheets API"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition font-semibold shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">
                  {isSyncing ? 'Sinkron...' : 'Sync Sheets'}
                </span>
                {googleSheetConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ring-2 ring-emerald-400/30 animate-pulse" title="Google Sheets Terhubung" />
                )}
              </button>
            )}

            {/* Reset / Clean Data Button (Only Admin) */}
            {isAdmin && (
              <button
                id="reset-data-nav-btn"
                onClick={onOpenResetData}
                title="Bersihkan data / Reset untuk mulai dari awal"
                className="flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs px-2.5 py-2 rounded-xl transition font-medium"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Bersihkan Data</span>
              </button>
            )}

            {/* Multi-Login User Profile & Switcher Button */}
            <div className="relative">
              {currentUser ? (
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition text-left ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-950/80 border-blue-700/60 hover:bg-blue-900/80 text-blue-100'
                      : currentUser.role === 'dosen'
                      ? 'bg-amber-950/80 border-amber-700/60 hover:bg-amber-900/80 text-amber-100'
                      : 'bg-emerald-950/80 border-emerald-700/60 hover:bg-emerald-900/80 text-emerald-100'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/20">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="hidden sm:block leading-tight">
                    <div className="text-xs font-bold truncate max-w-[130px] flex items-center gap-1">
                      <span>{currentUser.nama}</span>
                    </div>
                    <div className="text-[10px] opacity-80 flex items-center gap-1 font-semibold uppercase">
                      {currentUser.role === 'admin' && <ShieldCheck className="w-3 h-3 text-blue-400" />}
                      {currentUser.role === 'dosen' && <GraduationCap className="w-3 h-3 text-amber-400" />}
                      {currentUser.role === 'mahasiswa' && <UserCheck className="w-3 h-3 text-emerald-400" />}
                      <span>{currentUser.role}</span>
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-xl font-bold shadow-md transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login Pengguna</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {showUserMenu && currentUser && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info Header */}
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-2">
                      <div className="font-bold text-white text-xs truncate">
                        {currentUser.nama}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                        {currentUser.nipOrNim ? `ID: ${currentUser.nipOrNim}` : currentUser.email}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-700/60 text-slate-200">
                        Peran: <span className={
                          currentUser.role === 'admin' ? 'text-blue-400' :
                          currentUser.role === 'dosen' ? 'text-amber-400' :
                          'text-emerald-400'
                        }>{currentUser.role}</span>
                      </div>
                    </div>

                    {/* Switch User / Role Button */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenLoginModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition font-medium"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                      <span>Ganti Akun / Ganti Peran</span>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-xl transition font-medium mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Tabs (Only if not student, or if student has tabs) */}
      {!isMahasiswa && (
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
      )}
    </header>
  );
};
