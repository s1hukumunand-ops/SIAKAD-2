import React, { useState, useMemo } from 'react';
import { GoogleSheetsSyncConfig, Student, Course, StudentAttendanceMap, StudentGrade, ScheduleItem, UserAccount } from '../types';
import { googleAppsScriptTemplate } from '../data/initialData';
import { testAppsScriptConnection, pushDataToGoogleSheets } from '../services/googleSheetService';
import { getAllUserAccounts } from '../utils/authData';
import { 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  FileCode2, 
  Database, 
  Download, 
  Upload, 
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  KeyRound,
  Send
} from 'lucide-react';

interface GoogleSheetIntegrationTabProps {
  config: GoogleSheetsSyncConfig;
  onUpdateConfig: (config: Partial<GoogleSheetsSyncConfig>) => void;
  students: Student[];
  courses: Course[];
  attendanceMap: StudentAttendanceMap;
  grades: Record<string, Record<string, StudentGrade>>;
  schedules: ScheduleItem[];
  userAccounts?: UserAccount[];
  onImportData: (data: any) => void;
  onPullDataFromSheets: (url: string) => Promise<void>;
}

export const GoogleSheetIntegrationTab: React.FC<GoogleSheetIntegrationTabProps> = ({
  config,
  onUpdateConfig,
  students,
  courses,
  attendanceMap,
  grades,
  schedules,
  userAccounts,
  onImportData,
  onPullDataFromSheets,
}) => {
  const [urlInput, setUrlInput] = useState(config.webAppUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Derive all active user accounts dynamically
  const allDerivedUsers = useMemo(() => {
    return getAllUserAccounts(courses, students, userAccounts);
  }, [courses, students, userAccounts]);

  const userStats = useMemo(() => {
    const adminCount = allDerivedUsers.filter(u => u.role === 'admin').length;
    const dosenCount = allDerivedUsers.filter(u => u.role === 'dosen').length;
    const mhsCount = allDerivedUsers.filter(u => u.role === 'mahasiswa').length;
    return { adminCount, dosenCount, mhsCount, total: allDerivedUsers.length };
  }, [allDerivedUsers]);

  React.useEffect(() => {
    if (config.webAppUrl && config.webAppUrl !== urlInput) {
      setUrlInput(config.webAppUrl);
    }
  }, [config.webAppUrl]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(googleAppsScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setFeedback({ type: 'error', message: 'Silakan masukkan URL Google Apps Script Web App terlebih dahulu.' });
      return;
    }

    setIsTesting(true);
    setFeedback(null);
    onUpdateConfig({ webAppUrl: urlInput.trim(), status: 'testing' });

    const result = await testAppsScriptConnection(urlInput.trim());
    setIsTesting(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      onUpdateConfig({ status: 'success', errorMessage: undefined });
    } else {
      setFeedback({ type: 'error', message: result.message });
      onUpdateConfig({ status: 'error', errorMessage: result.message });
    }
  };

  const handlePullNow = async () => {
    if (!urlInput.trim()) {
      setFeedback({ type: 'error', message: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsPulling(true);
    setFeedback(null);

    try {
      await onPullDataFromSheets(urlInput.trim());
      setFeedback({ type: 'success', message: 'Data terbaru (termasuk Akun Pengguna) berhasil dimuat & disinkronkan dari Google Sheets!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menarik data dari Google Sheets.' });
    } finally {
      setIsPulling(false);
    }
  };

  const handleSyncNow = async () => {
    if (!urlInput.trim()) {
      setFeedback({ type: 'error', message: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsSyncing(true);
    setFeedback(null);
    onUpdateConfig({ status: 'syncing' });

    const result = await pushDataToGoogleSheets(urlInput.trim(), {
      students,
      courses,
      attendanceMap,
      grades,
      schedules,
      users: allDerivedUsers,
    });

    setIsSyncing(false);

    if (result.success) {
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setFeedback({ type: 'success', message: `${result.message} (Termasuk ${allDerivedUsers.length} akun pengguna pada tab Pengguna. Terakhir sinkron: ${now})` });
      onUpdateConfig({ status: 'success', lastSyncedAt: now });
    } else {
      setFeedback({ type: 'error', message: result.message });
      onUpdateConfig({ status: 'error', errorMessage: result.message });
    }
  };

  const handleInitializeAndPushUsersOnly = async () => {
    if (!urlInput.trim()) {
      setFeedback({ type: 'error', message: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setIsSyncingUsers(true);
    setFeedback(null);

    const result = await pushDataToGoogleSheets(urlInput.trim(), {
      students,
      courses,
      attendanceMap,
      grades,
      schedules,
      users: allDerivedUsers,
    });

    setIsSyncingUsers(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: `Berhasil! Sebanyak ${allDerivedUsers.length} akun pengguna (1 Admin, ${userStats.dosenCount} Dosen, ${userStats.mhsCount} Mahasiswa) telah berhasil disimpan ke lembar "Pengguna" di Google Sheets Anda!`
      });
    } else {
      setFeedback({
        type: 'error',
        message: `Gagal mengirim data akun pengguna: ${result.message}`
      });
    }
  };

  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      students,
      courses,
      attendanceMap,
      grades,
      schedules,
      users: allDerivedUsers,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_rekap_perkuliahan_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students || parsed.courses) {
          onImportData(parsed);
          setFeedback({ type: 'success', message: 'Data backup JSON berhasil dimuat ke aplikasi!' });
        } else {
          setFeedback({ type: 'error', message: 'Format file JSON tidak sesuai struktur aplikasi.' });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Gagal membaca file JSON. Pastikan file valid.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 rounded-2xl p-6 text-white border border-emerald-800/40 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-semibold flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Google Sheets & Apps Script Bridge API
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Integrasi Database Google Sheets
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              <strong>Sangat Bisa!</strong> Aplikasi web ini berkomunikasi secara langsung dengan spreadsheet Google Anda via <strong>Google Apps Script REST API</strong> tanpa memerlukan backend server tambahan.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-slate-300">Status Koneksi:</span>
            {config.status === 'success' ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Terhubung ke Google Sheets
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                <Cloud className="w-4 h-4 text-slate-400" />
                Siap Dihubungkan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Direct User Accounts Initialization & FAQ Card */}
      <div className="bg-gradient-to-br from-blue-900/10 via-white to-indigo-900/10 rounded-2xl p-6 border-2 border-blue-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Database & Autentikasi Pengguna (Tab "Pengguna" di Google Sheets)
                </h3>
                <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-200">
                  {userStats.total} Akun Tersedia
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Pertanyaan:</strong> Apakah saya harus menginputkan data pengguna (username & password) secara manual terlebih dahulu di Google Sheets?
              </p>
              <p className="text-xs text-emerald-700 font-bold mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>JAWABAN: TIDAK PERLU! Sistem secara otomatis membuat akun login default untuk seluruh dosen & mahasiswa.</span>
              </p>
            </div>
          </div>

          <button
            id="init-users-sheets-btn"
            onClick={handleInitializeAndPushUsersOnly}
            disabled={isSyncingUsers || !urlInput.trim()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md transition whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <Send className={`w-4 h-4 ${isSyncingUsers ? 'animate-spin' : ''}`} />
            <span>{isSyncingUsers ? 'Mengirim Data Akun...' : 'Kirim Semua Akun ke Sheet "Pengguna"'}</span>
          </button>
        </div>

        {/* Roles Breakdown Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>1 Akun Administrator</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Username: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">admin</code> • Pass: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">admin123</code>
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>{userStats.dosenCount} Akun Dosen Pengampu</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Username: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">NIP Dosen</code> • Pass: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">dosen123</code>
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{userStats.mhsCount} Akun Mahasiswa</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Username: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">NIM Mahasiswa</code> • Pass: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">mhs123</code>
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <p>
            💡 <strong>Kustomisasi Kata Sandi & Pengguna Tambahan:</strong> Jika Anda ingin mengubah kata sandi atau menambahkan akun baru, Anda cukup mengedit baris pada tab sheet <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-slate-800 border border-slate-200">Pengguna</code> di Google Sheets Anda, lalu klik tombol <strong>"Tarik Data dari Sheets"</strong> di aplikasi ini.
          </p>
        </div>
      </div>

      {/* Architecture Explanation Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Cara Kerja Arsitektur: HTML & JavaScript + Apps Script + Google Sheets</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-3">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Frontend Web (HTML/JS)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Menyediakan antarmuka input nilai, tabel absensi 14 pertemuan, jadwal kuliah, dan sistem evaluasi kehadiran secara interaktif.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Google Apps Script API</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Berperan sebagai REST API (fungsi <code className="bg-indigo-100 px-1 py-0.2 rounded text-indigo-800 font-mono">doGet()</code> & <code className="bg-indigo-100 px-1 py-0.2 rounded text-indigo-800 font-mono">doPost()</code>) untuk membaca & menulis data ke Spreadsheet secara aman.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Google Sheets Database</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Menyimpan data persisten secara terstruktur pada lembar sheet: <span className="font-semibold text-emerald-800">Mahasiswa, MataKuliah, Absensi, Nilai, Jadwal</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Endpoint Connector Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Konfigurasi Google Apps Script Web App Endpoint
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tempelkan URL Web App hasil deployment dari Google Apps Script Anda di bawah ini:
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Apps Script Web App URL:
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                id="apps-script-url-input"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="test-connection-btn"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-blue-400' : ''}`} />
                  <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
                </button>

                <button
                  id="pull-from-sheets-btn"
                  onClick={handlePullNow}
                  disabled={isPulling}
                  title="Tarik & perbarui data dari Google Sheets"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  <Download className={`w-3.5 h-3.5 ${isPulling ? 'animate-bounce' : ''}`} />
                  <span>{isPulling ? 'Menarik Data...' : 'Tarik Data dari Sheets'}</span>
                </button>

                <button
                  id="sync-now-btn"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  title="Kirim & timpa data ke Google Sheets"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Menyimpan...' : 'Kirim ke Sheets'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Diagnostic Feedback Alert */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{feedback.message}</p>
                {feedback.type === 'error' && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    Petunjuk: Pastikan pada jendela "New deployment", opsi <strong>"Who has access"</strong> dipilih <strong>"Anyone" (Siapa saja)</strong> agar peramban dapat mengakses API.
                  </p>
                )}
              </div>
            </div>
          )}

          {config.lastSyncedAt && (
            <p className="text-[11px] text-slate-500">
              Terakhir berhasil disinkronkan ke Google Sheets pada: <strong className="text-slate-700">{config.lastSyncedAt}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Step-by-Step Setup Guide */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-blue-600" />
          <span>Panduan Langkah Mudah Setup Google Sheets & Apps Script (5 Menit)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-blue-700">Langkah 1: Buat Google Sheet Baru</span>
            <p className="text-slate-600 leading-relaxed">
              Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> di browser untuk membuat spreadsheet kosong. Beri judul misalnya <em>"Database SIAKAD Perkuliahan"</em>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-blue-700">Langkah 2: Buka Editor Apps Script</span>
            <p className="text-slate-600 leading-relaxed">
              Pada menu atas Google Sheets, klik menu <strong>Extensions (Ekstensi)</strong> &rarr; pilih <strong>Apps Script</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-blue-700">Langkah 3: Salin Kode di Bawah</span>
            <p className="text-slate-600 leading-relaxed">
              Hapus kode default di file <code className="bg-slate-200 px-1 rounded font-mono">Code.gs</code>, lalu salin dan tempelkan seluruh script yang ada di kotak kode di bawah.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-blue-700">Langkah 4: Deploy sebagai Web App</span>
            <p className="text-slate-600 leading-relaxed">
              Klik <strong>Deploy</strong> &rarr; <strong>New deployment</strong> &rarr; Pilih jenis <strong>Web app</strong> &rarr; Set <em>Execute as:</em> <strong>"Me"</strong> &amp; <em>Who has access:</em> <strong>"Anyone"</strong>.
            </p>
          </div>
        </div>

        {/* Apps Script Ready Code Viewer */}
        <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono text-slate-300 ml-2">Code.gs (Google Apps Script)</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-lg font-semibold transition"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kode Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Seluruh Kode (.gs)</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-80 scrollbar-thin scrollbar-thumb-slate-700 leading-relaxed">
            {googleAppsScriptTemplate}
          </pre>
        </div>
      </div>

      {/* Offline Backup & JSON Export / Import */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Backup Lokal & Pemulihan Data (Offline JSON)</h3>
          <p className="text-xs text-slate-500">
            Selain Google Sheets, Anda juga dapat mengunduh seluruh data aplikasi sebagai file JSON untuk backup sewaktu-waktu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition border border-slate-200 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Backup JSON</span>
          </button>

          <label className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Impor JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
