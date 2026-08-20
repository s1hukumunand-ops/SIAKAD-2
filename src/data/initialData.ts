import { Student, Course, StudentAttendanceMap, StudentGrade, ScheduleItem } from '../types';

// Clean Default Initial State
export const initialStudents: Student[] = [];

export const initialCourses: Course[] = [
  {
    id: 'crs-1',
    kode: 'HKM-101',
    nama: 'Hukum Tata Negara & Konstitusi',
    sks: 3,
    semester: 'Semester Ganjil 2024/2025',
    kelas: 'Kelas A',
    dosenPengampu: 'Dosen Pengampu',
    nipDosen: '-',
    ruangan: 'Ruang Kuliah',
    jadwalHari: 'Senin',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    minAttendancePercent: 75,
    gradeWeights: {
      kehadiran: 10,
      tugas: 20,
      kuis: 10,
      uts: 30,
      uas: 30,
    },
    meetings: Array.from({ length: 14 }, (_, i) => ({
      meetingNumber: i + 1,
      date: '',
      topic: i === 7 ? 'Pelaksanaan Ujian Tengah Semester (UTS)' : `Pokok Bahasan Pertemuan ${i + 1}`,
      mode: 'Tatap Muka',
      dosenHadir: true,
      isCompleted: false,
    })),
  }
];

export const initialAttendanceMap: StudentAttendanceMap = {};

export const initialGrades: Record<string, Record<string, StudentGrade>> = {};

export const initialSchedules: ScheduleItem[] = [];

// Demo / Simulation Data (For Restore Demo Data feature)
export const demoStudents: Student[] = [
  {
    id: 'std-1',
    nim: '2110112001',
    nama: 'Ahmad Fauzi Pratama',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '081234567890',
    email: 'ahmad.fauzi@student.univ.ac.id',
    jenisKelamin: 'L',
  },
  {
    id: 'std-2',
    nim: '2110112002',
    nama: 'Bunga Citra Lestari',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '081298765432',
    email: 'bunga.citra@student.univ.ac.id',
    jenisKelamin: 'P',
  },
  {
    id: 'std-3',
    nim: '2110112003',
    nama: 'Dimas Aditya Nugraha',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '085712345678',
    email: 'dimas.aditya@student.univ.ac.id',
    jenisKelamin: 'L',
  },
  {
    id: 'std-4',
    nim: '2110112004',
    nama: 'Fatimah Az-Zahra',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '081345678901',
    email: 'fatimah.zahra@student.univ.ac.id',
    jenisKelamin: 'P',
  },
  {
    id: 'std-5',
    nim: '2110112005',
    nama: 'Gilang Ramadhan',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '081987654321',
    email: 'gilang.ramadhan@student.univ.ac.id',
    jenisKelamin: 'L',
  },
  {
    id: 'std-6',
    nim: '2110112006',
    nama: 'Hafizhah Nurul Ilmi',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '082134567890',
    email: 'hafizhah.ilmi@student.univ.ac.id',
    jenisKelamin: 'P',
  },
  {
    id: 'std-7',
    nim: '2110112007',
    nama: 'Irfan Maulana Akbar',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '085678901234',
    email: 'irfan.maulana@student.univ.ac.id',
    jenisKelamin: 'L',
  },
  {
    id: 'std-8',
    nim: '2110112008',
    nama: 'Kezia Aurelia Putri',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '087812345678',
    email: 'kezia.aurelia@student.univ.ac.id',
    jenisKelamin: 'P',
  },
  {
    id: 'std-9',
    nim: '2110112009',
    nama: 'Muhammad Rizky Ramadhan',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '089612345678',
    email: 'm.rizky@student.univ.ac.id',
    jenisKelamin: 'L',
  },
  {
    id: 'std-10',
    nim: '2110112010',
    nama: 'Nabila Syahrani',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '081223344556',
    email: 'nabila.syahrani@student.univ.ac.id',
    jenisKelamin: 'P',
  },
  {
    id: 'std-11',
    nim: '2110112011',
    nama: 'Rendi Oktavian Syahputra',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '081399887766',
    email: 'rendi.oktavian@student.univ.ac.id',
    jenisKelamin: 'L',
  },
  {
    id: 'std-12',
    nim: '2110112012',
    nama: 'Siti Rahmawati Dewi',
    prodi: 'Ilmu Hukum',
    angkatan: '2021',
    noHp: '085211223344',
    email: 'siti.rahmawati@student.univ.ac.id',
    jenisKelamin: 'P',
  }
];

export const demoCourses: Course[] = [
  {
    id: 'crs-1',
    kode: 'HKM-301',
    nama: 'Hukum Tata Negara & Konstitusi',
    sks: 3,
    semester: 'Semester Ganjil 2024/2025',
    kelas: 'Kelas A',
    dosenPengampu: 'Prof. Dr. H. Saldi Isra, S.H., M.P.A.',
    nipDosen: '196808201994031002',
    ruangan: 'Gedung A - Ruang 204',
    jadwalHari: 'Senin',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    minAttendancePercent: 75,
    gradeWeights: {
      kehadiran: 10,
      tugas: 20,
      kuis: 10,
      uts: 30,
      uas: 30,
    },
    meetings: [
      { meetingNumber: 1, date: '2024-09-02', topic: 'Kontrak Kuliah & Pengantar Hukum Tata Negara', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 2, date: '2024-09-09', topic: 'Teori Konstitusi & Hierarki Peraturan Perundang-Undangan', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 3, date: '2024-09-16', topic: 'Bentuk Negara, Bentuk Pemerintahan & Sistem Presidensial', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 4, date: '2024-09-23', topic: 'Lembaga Kepresidenan & Wewenang Eksekutif', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 5, date: '2024-09-30', topic: 'Lembaga Perwakilan Rakyat (DPR, DPD, MPR)', mode: 'Daring', dosenHadir: true, isCompleted: true },
      { meetingNumber: 6, date: '2024-10-07', topic: 'Kekuasaan Kehakiman (MA, MK, KY)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 7, date: '2024-10-14', topic: 'Review Materi Tengah Semester & Diskusi Kasus Konstitusi', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 8, date: '2024-10-21', topic: 'Pelaksanaan Ujian Tengah Semester (UTS)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 9, date: '2024-10-28', topic: 'Hak Asasi Manusia dalam Konstitusi Indonesia', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 10, date: '2024-11-04', topic: 'Hubungan Pemerintah Pusat dan Daerah (Otonomi Daerah)', mode: 'Hybrid', dosenHadir: true, isCompleted: true },
      { meetingNumber: 11, date: '2024-11-11', topic: 'Hukum Acara Mahkamah Konstitusi & Pengujian UU (Judicial Review)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 12, date: '2024-11-18', topic: 'Sistem Pemilihan Umum & Demokrasi Konstitusional', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 13, date: '2024-11-25', topic: 'Lembaga Negara Independen (KPK, KPU, Bawaslu, Komnas HAM)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 14, date: '2024-12-02', topic: 'Kapita Selekta & Evaluasi Kesiapan UAS', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
    ]
  },
  {
    id: 'crs-2',
    kode: 'HKM-304',
    nama: 'Hukum Acara Pidana',
    sks: 3,
    semester: 'Semester Ganjil 2024/2025',
    kelas: 'Kelas B',
    dosenPengampu: 'Dr. Kurnia Warman, S.H., M.Hum.',
    nipDosen: '197205151998021001',
    ruangan: 'Gedung B - Ruang Peradilan Semu',
    jadwalHari: 'Rabu',
    jamMulai: '10:30',
    jamSelesai: '13:00',
    minAttendancePercent: 75,
    gradeWeights: {
      kehadiran: 10,
      tugas: 25,
      kuis: 10,
      uts: 25,
      uas: 30,
    },
    meetings: Array.from({ length: 14 }, (_, i) => ({
      meetingNumber: i + 1,
      date: `2024-${String(9 + Math.floor(i / 4)).padStart(2, '0')}-${String(4 + ((i % 4) * 7)).padStart(2, '0')}`,
      topic: i === 7 ? 'Ujian Tengah Semester (UTS)' : `Pokok Bahasan Pertemuan ke-${i + 1}: Hukum Pembuktian & Acara Sidang Pidana`,
      mode: i === 4 || i === 9 ? 'Daring' : 'Tatap Muka',
      dosenHadir: true,
      isCompleted: true,
    }))
  },
  {
    id: 'crs-3',
    kode: 'HKM-202',
    nama: 'Hukum Perdata & Kontrak Bisnis',
    sks: 3,
    semester: 'Semester Ganjil 2024/2025',
    kelas: 'Kelas C',
    dosenPengampu: 'Dr. Yuliandri, S.H., M.H.',
    nipDosen: '196207181988111001',
    ruangan: 'Gedung C - Ruang 102',
    jadwalHari: 'Kamis',
    jamMulai: '13:30',
    jamSelesai: '16:00',
    minAttendancePercent: 75,
    gradeWeights: {
      kehadiran: 15,
      tugas: 20,
      kuis: 15,
      uts: 25,
      uas: 25,
    },
    meetings: Array.from({ length: 14 }, (_, i) => ({
      meetingNumber: i + 1,
      date: `2024-${String(9 + Math.floor(i / 4)).padStart(2, '0')}-${String(5 + ((i % 4) * 7)).padStart(2, '0')}`,
      topic: `Materi Pertemuan ke-${i + 1}: Asas Hukum Perikatan & Perancangan Kontrak`,
      mode: 'Tatap Muka',
      dosenHadir: true,
      isCompleted: true,
    }))
  }
];

// Pre-fill realistic attendance map for course crs-1 across 14 meetings
export const demoAttendanceMap: StudentAttendanceMap = {
  'crs-1': {
    // Ahmad Fauzi: Perfect attendance
    'std-1': { 1: 'H', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Bunga Citra: 1 Izin, 13 Hadir
    'std-2': { 1: 'H', 2: 'H', 3: 'I', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Dimas Aditya: WARNING (3 Alpa, at limit)
    'std-3': { 1: 'H', 2: 'A', 3: 'H', 4: 'H', 5: 'A', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'A', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Fatimah: Safe (1 Sakit)
    'std-4': { 1: 'H', 2: 'H', 3: 'H', 4: 'S', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Gilang Ramadhan: CRITICAL / DICEKAL UAS (5 Alpa, 1 Sakit -> < 75%)
    'std-5': { 1: 'H', 2: 'A', 3: 'A', 4: 'H', 5: 'A', 6: 'S', 7: 'H', 8: 'H', 9: 'A', 10: 'H', 11: 'A', 12: 'H', 13: 'H', 14: 'H' },
    // Hafizhah: 14 Hadir
    'std-6': { 1: 'H', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Irfan Maulana: CRITICAL / DICEKAL UAS (4 Alpa, 2 Izin -> percentage < 75%)
    'std-7': { 1: 'A', 2: 'H', 3: 'H', 4: 'A', 5: 'I', 6: 'H', 7: 'A', 8: 'H', 9: 'H', 10: 'I', 11: 'A', 12: 'H', 13: 'H', 14: 'H' },
    // Kezia: Safe (1 Izin, 1 Sakit)
    'std-8': { 1: 'H', 2: 'H', 3: 'I', 4: 'H', 5: 'H', 6: 'H', 7: 'S', 8: 'H', 9: 'H', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Muhammad Rizky: WARNING (3 Alpa)
    'std-9': { 1: 'H', 2: 'H', 3: 'A', 4: 'H', 5: 'H', 6: 'A', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'A', 12: 'H', 13: 'H', 14: 'H' },
    // Nabila: 14 Hadir
    'std-10': { 1: 'H', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Rendi: Safe (2 Izin)
    'std-11': { 1: 'H', 2: 'I', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'I', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
    // Siti Rahmawati: 14 Hadir
    'std-12': { 1: 'H', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H', 12: 'H', 13: 'H', 14: 'H' },
  }
};

export const demoGrades: Record<string, Record<string, StudentGrade>> = {
  // courseId -> studentId -> Grade
  'crs-1': {
    'std-1': { studentId: 'std-1', courseId: 'crs-1', tugas: 88, kuis: 90, uts: 85, uas: 92, catatan: 'Sangat aktif dalam diskusi' },
    'std-2': { studentId: 'std-2', courseId: 'crs-1', tugas: 85, kuis: 82, uts: 80, uas: 86, catatan: 'Tugas terstruktur sangat baik' },
    'std-3': { studentId: 'std-3', courseId: 'crs-1', tugas: 74, kuis: 70, uts: 75, uas: 72, catatan: 'Perlu peningkatan kehadiran' },
    'std-4': { studentId: 'std-4', courseId: 'crs-1', tugas: 90, kuis: 95, uts: 88, uas: 90, catatan: 'Prestasi akademik memuaskan' },
    'std-5': { studentId: 'std-5', courseId: 'crs-1', tugas: 60, kuis: 55, uts: 58, uas: 0, catatan: 'Dicekal UAS karena absensi kurang dari 75%' },
    'std-6': { studentId: 'std-6', courseId: 'crs-1', tugas: 92, kuis: 88, uts: 90, uas: 94, catatan: 'Mahasiswa berprestasi' },
    'std-7': { studentId: 'std-7', courseId: 'crs-1', tugas: 65, kuis: 60, uts: 62, uas: 0, catatan: 'Dicekal UAS akibat alpa > 3 kali' },
    'std-8': { studentId: 'std-8', courseId: 'crs-1', tugas: 82, kuis: 80, uts: 84, uas: 85, catatan: 'Rajin dan bertanggung jawab' },
    'std-9': { studentId: 'std-9', courseId: 'crs-1', tugas: 78, kuis: 75, uts: 76, uas: 80, catatan: 'Cukup baik' },
    'std-10': { studentId: 'std-10', courseId: 'crs-1', tugas: 95, kuis: 92, uts: 94, uas: 96, catatan: 'Terbaik di kelas' },
    'std-11': { studentId: 'std-11', courseId: 'crs-1', tugas: 80, kuis: 78, uts: 82, uas: 84, catatan: 'Baik' },
    'std-12': { studentId: 'std-12', courseId: 'crs-1', tugas: 89, kuis: 86, uts: 88, uas: 90, catatan: 'Sangat baik' },
  }
};

export const demoSchedules: ScheduleItem[] = [
  {
    id: 'sch-1',
    courseId: 'crs-1',
    namaMK: 'Hukum Tata Negara & Konstitusi',
    kodeMK: 'HKM-301',
    sks: 3,
    hari: 'Senin',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    ruangan: 'Gedung A - Ruang 204',
    dosen: 'Prof. Dr. H. Saldi Isra, S.H., M.P.A.',
    kelas: 'Kelas A',
    warna: 'blue',
  },
  {
    id: 'sch-2',
    courseId: 'crs-2',
    namaMK: 'Hukum Acara Pidana',
    kodeMK: 'HKM-304',
    sks: 3,
    hari: 'Rabu',
    jamMulai: '10:30',
    jamSelesai: '13:00',
    ruangan: 'Gedung B - Ruang Peradilan Semu',
    dosen: 'Dr. Kurnia Warman, S.H., M.Hum.',
    kelas: 'Kelas B',
    warna: 'purple',
  },
  {
    id: 'sch-3',
    courseId: 'crs-3',
    namaMK: 'Hukum Perdata & Kontrak Bisnis',
    kodeMK: 'HKM-202',
    sks: 3,
    hari: 'Kamis',
    jamMulai: '13:30',
    jamSelesai: '16:00',
    ruangan: 'Gedung C - Ruang 102',
    dosen: 'Dr. Yuliandri, S.H., M.H.',
    kelas: 'Kelas C',
    warna: 'emerald',
  },
  {
    id: 'sch-4',
    courseId: 'crs-4',
    namaMK: 'Metodologi Penelitian Hukum',
    kodeMK: 'HKM-401',
    sks: 2,
    hari: 'Selasa',
    jamMulai: '09:00',
    jamSelesai: '10:40',
    ruangan: 'Gedung A - Ruang 301',
    dosen: 'Dr. Ferdi, S.H., M.H.',
    kelas: 'Kelas A',
    warna: 'amber',
  },
  {
    id: 'sch-5',
    courseId: 'crs-5',
    namaMK: 'Hukum Internasional & Perjanjian',
    kodeMK: 'HKM-305',
    sks: 2,
    hari: 'Jumat',
    jamMulai: '08:00',
    jamSelesai: '09:40',
    ruangan: 'Gedung B - Ruang 105',
    dosen: 'Dr. Charles Simabura, S.H., M.H.',
    kelas: 'Kelas A',
    warna: 'indigo',
  }
];

export const googleAppsScriptTemplate = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT API UNTUK REKAP PERKULIAHAN & ABSENSI MAHASISWA
 * ============================================================================
 * Cara Pasang:
 * 1. Buat Google Sheet baru di Google Drive Anda (https://sheets.new)
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script"
 * 3. Hapus kode yang ada, lalu salin dan tempelkan SELURUH kode di bawah ini.
 * 4. Klik tombol "Save" (Simpan), lalu klik "Deploy" > "New deployment"
 * 5. Pilih Type: "Web app"
 *    - Description: "SIAKAD API Endpoint"
 *    - Execute as: "Me" (Email Google Anda)
 *    - Who has access: "Anyone" (Siapa saja, agar aplikasi web dapat memanggil)
 * 6. Klik "Deploy", beri izin akses (Authorize), lalu SALIN Web App URL yang muncul.
 * 7. Tempelkan URL tersebut ke kolom "Google Apps Script Web App URL" di aplikasi ini!
 * ============================================================================
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action || 'getAll';
    
    // Inisialisasi sheet otomatis jika belum ada
    initializeSheetsIfNeeded(ss);

    let result = {};

    if (action === 'ping') {
      result = { status: 'success', message: 'Koneksi ke Google Sheets & Apps Script Berhasil Terhubung!', timestamp: new Date().toISOString() };
    } else if (action === 'getAll') {
      result = {
        status: 'success',
        students: getSheetDataAsJson(ss.getSheetByName('Mahasiswa')),
        courses: getSheetDataAsJson(ss.getSheetByName('MataKuliah')),
        attendance: getSheetDataAsJson(ss.getSheetByName('Absensi14Pertemuan')),
        grades: getSheetDataAsJson(ss.getSheetByName('Nilai')),
        schedules: getSheetDataAsJson(ss.getSheetByName('JadwalKuliah')),
        timestamp: new Date().toISOString()
      };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfNeeded(ss);

    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || 'syncAll';

    if (action === 'syncAll') {
      if (postData.students) saveJsonToSheet(ss.getSheetByName('Mahasiswa'), postData.students);
      if (postData.courses) saveJsonToSheet(ss.getSheetByName('MataKuliah'), postData.courses);
      if (postData.attendance) saveJsonToSheet(ss.getSheetByName('Absensi14Pertemuan'), postData.attendance);
      if (postData.grades) saveJsonToSheet(ss.getSheetByName('Nilai'), postData.grades);
      if (postData.schedules) saveJsonToSheet(ss.getSheetByName('JadwalKuliah'), postData.schedules);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data Rekap Perkuliahan & Absensi Berhasil Disimpan ke Google Sheets!',
        updatedRows: postData.students ? postData.students.length : 0,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action: ' + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function initializeSheetsIfNeeded(ss) {
  const requiredSheets = ['Mahasiswa', 'MataKuliah', 'Absensi14Pertemuan', 'Nilai', 'JadwalKuliah'];
  requiredSheets.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
  });
}

function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      obj[headers[j]] = val;
    }
    rows.push(obj);
  }
  return rows;
}

function saveJsonToSheet(sheet, items) {
  if (!sheet) return;
  sheet.clear();
  if (!items || items.length === 0) return;
  
  const keySet = {};
  items.forEach(item => {
    Object.keys(item).forEach(k => { keySet[k] = true; });
  });
  const headers = Object.keys(keySet);
  if (headers.length === 0) return;

  const rows = [headers];
  
  items.forEach(item => {
    const row = headers.map(h => {
      const val = item[h];
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val !== undefined && val !== null ? val : '';
    });
    rows.push(row);
  });
  
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  
  // Format Header Aesthetic
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1e293b');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  sheet.autoResizeColumns(1, headers.length);
}
`;
