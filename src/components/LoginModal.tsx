import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, Course, Student, UserRole, UserAccount, GoogleSheetsSyncConfig } from '../types';
import { 
  ADMIN_USER, 
  getAllUserAccounts, 
  verifyCredentials 
} from '../utils/authData';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Lock, 
  User, 
  LogIn, 
  AlertCircle,
  Building2,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  X
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (user: AuthUser) => void;
  onClose?: () => void;
  courses: Course[];
  students: Student[];
  userAccounts?: UserAccount[];
  googleConfig?: GoogleSheetsSyncConfig;
  onSyncFromGoogleSheets?: (url?: string) => Promise<boolean | void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  onClose,
  courses,
  students,
  userAccounts: propAccounts,
  googleConfig,
  onSyncFromGoogleSheets,
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('admin');
  
  // Standard Secure Form State (Starts Blank)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback & Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Derive all active user accounts from actual courses, students, and synced Google Sheet records
  const allAccounts = useMemo(() => {
    return getAllUserAccounts(courses, students, propAccounts);
  }, [courses, students, propAccounts]);

  // Reset inputs when switching role tabs
  useEffect(() => {
    setUsernameInput('');
    setPasswordInput('');
    setErrorMessage('');
    setSyncFeedback(null);
  }, [activeRoleTab]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = usernameInput.trim();
    const cleanPassword = passwordInput.trim();

    if (!cleanUsername) {
      if (activeRoleTab === 'admin') {
        setErrorMessage('Silakan masukkan Username atau Email Administrator.');
      } else if (activeRoleTab === 'dosen') {
        setErrorMessage('Silakan masukkan NIP atau Username Dosen Pengampu.');
      } else {
        setErrorMessage('Silakan masukkan Nomor Induk Mahasiswa (NIM).');
      }
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Silakan masukkan kata sandi (password) akun Anda.');
      return;
    }

    // Secure credential verification against user database
    const verification = verifyCredentials(cleanUsername, cleanPassword, allAccounts);

    if (verification.success && verification.user) {
      // If role matches active tab, or auto-detect if valid
      onLogin(verification.user);
      if (onClose) onClose();
    } else {
      setErrorMessage(verification.message || 'Username, NIP/NIM, atau Kata Sandi tidak cocok.');
    }
  };

  const handleSyncFromSheets = async () => {
    if (!onSyncFromGoogleSheets) return;
    setIsSyncing(true);
    setSyncFeedback(null);
    setErrorMessage('');

    try {
      await onSyncFromGoogleSheets(googleConfig?.webAppUrl);
      setSyncFeedback({
        type: 'success',
        message: 'Data pengguna berhasil disinkronkan dari Google Sheets!',
      });
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err?.message || 'Gagal menyinkronkan data akun dari Google Sheets.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Close Button if onClose provided */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Modal Login"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition border border-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Branding */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-2.5 border border-blue-400/30">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>

          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
            Sistem Informasi Akademik & Presensi
          </h2>
          <p className="text-xs sm:text-sm text-blue-200/90 mt-1 max-w-md mx-auto">
            Fakultas Hukum • Universitas Andalas
          </p>

          {/* Role Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-5 p-1.5 bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-800 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => { setActiveRoleTab('admin'); }}
              className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition ${
                activeRoleTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveRoleTab('dosen'); }}
              className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition ${
                activeRoleTab === 'dosen'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Dosen</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveRoleTab('mahasiswa'); }}
              className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition ${
                activeRoleTab === 'mahasiswa'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Mahasiswa</span>
            </button>
          </div>
        </div>

        

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Sync Feedback Message */}
          {syncFeedback && (
            <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {syncFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="leading-relaxed font-medium">{syncFeedback.message}</div>
            </div>
          )}

          {/* Role Guidance Card */}
          {activeRoleTab === 'admin' && (
            <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Portal Administrator</h4>
                  <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                    Akses penuh pengelolaan mata kuliah, presensi 14 pertemuan, rekap nilai, dan sinkronisasi Google Sheets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'dosen' && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Portal Dosen Pengampu</h4>
                  <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                    Masuk menggunakan NIP atau Username Dosen Anda untuk mengelola kelas perkuliahan dan input nilai mahasiswa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'mahasiswa' && (
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Portal Mahasiswa</h4>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                    Masuk menggunakan Nomor Induk Mahasiswa (NIM) untuk melihat rekap kehadiran presensi dan Kartu Hasil Studi (KHS).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {activeRoleTab === 'admin' 
                  ? 'Username / Email Admin' 
                  : activeRoleTab === 'dosen' 
                  ? 'Nomor Induk Pegawai (NIP) / Username Dosen' 
                  : 'Nomor Induk Mahasiswa (NIM)'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  autoComplete="username"
                  placeholder={
                    activeRoleTab === 'admin'
                      ? 'Masukkan username atau email admin'
                      : activeRoleTab === 'dosen'
                      ? 'Contoh NIP: 19800101...'
                      : 'Contoh NIM: 2110112001'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi akun"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 mt-2 ${
                activeRoleTab === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : activeRoleTab === 'dosen'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {activeRoleTab === 'admin'
                  ? 'Masuk sebagai Administrator'
                  : activeRoleTab === 'dosen'
                  ? 'Masuk sebagai Dosen Pengampu'
                  : 'Masuk ke Portal Mahasiswa'}
              </span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>SIAKAD Multi-Role Authentication</span>
          </div>
          <span>Sistem Akademik Terproteksi</span>
        </div>
      </div>
    </div>
  );
};
