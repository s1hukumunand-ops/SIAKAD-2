import { Student, Course, StudentAttendanceMap, StudentGrade, ScheduleItem } from '../types';

// Clean Default Initial State
export const initialStudents: Student[] = [];

export const initialCourses: Course[] = [
  {
    id: 'crs-1',
    kode: 'HKM-101',
    nama: 'Hukum Tata Negara & Konstitusi',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
    kelas: 'Kelas A',
    dosenPengampu: 'Dr. Hendra Syahputra, S.H., M.H.',
    nipDosen: '198501012010121002',
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
      { meetingNumber: 1, date: '2026-09-07', topic: 'Kontrak Perkuliahan, Rencana Pembelajaran Semester (RPS) & Pengantar Hukum Tata Negara', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 2, date: '2026-09-14', topic: 'Teori Konstitusi, Klasifikasi & Hierarki Peraturan Perundang-Undangan', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 3, date: '2026-09-21', topic: 'Bentuk Negara, Bentuk Pemerintahan & Sistem Presidensial Indonesia', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 4, date: '2026-09-28', topic: 'Lembaga Kepresidenan & Wewenang Eksekutif dalam UUD 1945', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 5, date: '2026-10-05', topic: 'Lembaga Perwakilan Rakyat (DPR, DPD, MPR) & Fungsi Legislasi (Daring)', mode: 'Daring', dosenHadir: true, isCompleted: true },
      { meetingNumber: 6, date: '2026-10-12', topic: 'Kekuasaan Kehakiman & Penegakan Hukum Konstitusi (MA, MK, KY)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 7, date: '2026-10-19', topic: 'Review Materi Tengah Semester & Diskusi Kasus Uji Materiil', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 8, date: '2026-10-26', topic: 'Pelaksanaan Ujian Tengah Semester (UTS)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 9, date: '2026-11-02', topic: 'Hak Asasi Manusia dan Warga Negara dalam Konstitusi Indonesia', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 10, date: '2026-11-09', topic: 'Hubungan Pemerintah Pusat dan Daerah serta Otonomi Khusus', mode: 'Hybrid', dosenHadir: true, isCompleted: true },
      { meetingNumber: 11, date: '2026-11-16', topic: 'Hukum Acara Mahkamah Konstitusi & Praktik Judicial Review', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 12, date: '2026-11-23', topic: 'Sistem Pemilihan Umum & Demokrasi Konstitusional di Indonesia', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 13, date: '2026-11-30', topic: 'Lembaga Negara Independen (KPK, KPU, Bawaslu, Komnas HAM)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 14, date: '2026-12-07', topic: 'Kapita Selekta Hukum Tata Negara & Evaluasi Capaian Pembelajaran UAS', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
    ],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1'], // Enrolled in 1 course
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1', 'crs-2'], // Enrolled in 2 courses
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1', 'crs-3'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1', 'crs-2', 'crs-3'], // Enrolled in 3 courses
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1', 'crs-2'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1', 'crs-3'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1'],
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
    semester: 'Semester Ganjil 2026/2027',
    courseIds: ['crs-1', 'crs-2', 'crs-3'],
  }
];

export const demoCourses: Course[] = [
  {
    id: 'crs-1',
    kode: 'HKM-301',
    nama: 'Hukum Tata Negara & Konstitusi',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
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
      { meetingNumber: 1, date: '2026-09-07', topic: 'Kontrak Kuliah & Pengantar Hukum Tata Negara', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 2, date: '2026-09-14', topic: 'Teori Konstitusi & Hierarki Peraturan Perundang-Undangan', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 3, date: '2026-09-21', topic: 'Bentuk Negara, Bentuk Pemerintahan & Sistem Presidensial', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 4, date: '2026-09-28', topic: 'Lembaga Kepresidenan & Wewenang Eksekutif', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 5, date: '2026-10-05', topic: 'Lembaga Perwakilan Rakyat (DPR, DPD, MPR)', mode: 'Daring', dosenHadir: true, isCompleted: true },
      { meetingNumber: 6, date: '2026-10-12', topic: 'Kekuasaan Kehakiman (MA, MK, KY)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 7, date: '2026-10-19', topic: 'Review Materi Tengah Semester & Diskusi Kasus Konstitusi', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 8, date: '2026-10-26', topic: 'Pelaksanaan Ujian Tengah Semester (UTS)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 9, date: '2026-11-02', topic: 'Hak Asasi Manusia dalam Konstitusi Indonesia', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 10, date: '2026-11-09', topic: 'Hubungan Pemerintah Pusat dan Daerah (Otonomi Daerah)', mode: 'Hybrid', dosenHadir: true, isCompleted: true },
      { meetingNumber: 11, date: '2026-11-16', topic: 'Hukum Acara Mahkamah Konstitusi & Pengujian UU (Judicial Review)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 12, date: '2026-11-23', topic: 'Sistem Pemilihan Umum & Demokrasi Konstitusional', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 13, date: '2026-11-30', topic: 'Lembaga Negara Independen (KPK, KPU, Bawaslu, Komnas HAM)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 14, date: '2026-12-07', topic: 'Kapita Selekta & Evaluasi Kesiapan UAS', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
    ]
  },
  {
    id: 'crs-2',
    kode: 'HKM-304',
    nama: 'Hukum Acara Pidana',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
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
    meetings: [
      { meetingNumber: 1, date: '2026-09-02', topic: 'Pengantar Hukum Acara Pidana & Asas-Asas Peradilan Pidana', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 2, date: '2026-09-09', topic: 'Penyelidikan dan Penyidikan dalam KUHAP', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 3, date: '2026-09-16', topic: 'Upaya Paksa (Penangkapan, Penahanan, Penggeledahan, Penyitaan)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 4, date: '2026-09-23', topic: 'Prapenadilan & Perlindungan Hak Tersangka', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 5, date: '2026-09-30', topic: 'Penuntutan & Surat Dakwaan Jaksa Penuntut Umum (Daring)', mode: 'Daring', dosenHadir: true, isCompleted: true },
      { meetingNumber: 6, date: '2026-10-07', topic: 'Kewenangan Mengadili & Eksepsi Penasihat Hukum', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 7, date: '2026-10-14', topic: 'Review Materi Pembuktian Pra-UTS', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 8, date: '2026-10-21', topic: 'Pelaksanaan Ujian Tengah Semester (UTS)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 9, date: '2026-10-28', topic: 'Alat Bukti & Kekuatan Pembuktian dalam Sidang Pidana', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 10, date: '2026-11-04', topic: 'Pemeriksaan Saksi, Ahli & Terdakwa (Hybrid)', mode: 'Hybrid', dosenHadir: true, isCompleted: true },
      { meetingNumber: 11, date: '2026-11-11', topic: 'Surat Tuntutan (Requisitoir) & Pledoi Pembelaan', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 12, date: '2026-11-18', topic: 'Musyawarah Majelis Hakim & Putusan Pengadilan', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 13, date: '2026-11-25', topic: 'Upaya Hukum Biasa (Banding, Kasasi) & Luar Biasa (PK)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 14, date: '2026-12-02', topic: 'Simulasi Sidang Peradilan Semu & Evaluasi Kesiapan UAS', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
    ]
  },
  {
    id: 'crs-3',
    kode: 'HKM-202',
    nama: 'Hukum Perdata & Kontrak Bisnis',
    sks: 3,
    semester: 'Semester Ganjil 2026/2027',
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
    meetings: [
      { meetingNumber: 1, date: '2026-09-03', topic: 'Asas-Asas Hukum Perikatan & Ruang Lingkup Kontrak', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 2, date: '2026-09-10', topic: 'Syarat Sahnya Perjanjian (Pasal 1320 KUHPerdata)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 3, date: '2026-09-17', topic: 'Wanprestasi, Somasi dan Ganti Kerugian', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 4, date: '2026-09-24', topic: 'Overmacht / Force Majeure dalam Transaksi Bisnis', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 5, date: '2026-10-01', topic: 'Hapusnya Perikatan & Pembatalan Kontrak (Daring)', mode: 'Daring', dosenHadir: true, isCompleted: true },
      { meetingNumber: 6, date: '2026-10-08', topic: 'Anatomi & Klausul-Klausul Standar Kontrak Bisnis', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 7, date: '2026-10-15', topic: 'Review Materi Perikatan Pra-UTS', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 8, date: '2026-10-22', topic: 'Pelaksanaan Ujian Tengah Semester (UTS)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 9, date: '2026-10-29', topic: 'Perjanjian Jual Beli, Sewa Menyewa & Pinjam Meminjam', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 10, date: '2026-11-05', topic: 'Kontrak Elektronik (E-Commerce) & Tanda Tangan Digital (Hybrid)', mode: 'Hybrid', dosenHadir: true, isCompleted: true },
      { meetingNumber: 11, date: '2026-11-12', topic: 'Penyusunan MoU, Perjanjian Kerjasama & Non-Disclosure Agreement', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 12, date: '2026-11-19', topic: 'Penyelesaian Sengketa Kontrak (Negosiasi, Mediasi, Arbitrase)', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 13, date: '2026-11-26', topic: 'Legal Due Diligence & Audit Kontrak Komersial', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
      { meetingNumber: 14, date: '2026-12-03', topic: 'Praktik Legal Drafting Kontrak Bisnis & Kesiapan UAS', mode: 'Tatap Muka', dosenHadir: true, isCompleted: true },
    ]
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
        users: getSheetDataAsJson(ss.getSheetByName('Pengguna')),
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

    let postData = {};
    try {
      postData = JSON.parse(e.postData.contents);
    } catch(err) {
      postData = {};
    }
    const action = postData.action || 'syncAll';

    if (action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Koneksi ke Google Sheets & Apps Script Berhasil Terhubung!',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'getAll') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        students: getSheetDataAsJson(ss.getSheetByName('Mahasiswa')),
        courses: getSheetDataAsJson(ss.getSheetByName('MataKuliah')),
        attendance: getSheetDataAsJson(ss.getSheetByName('Absensi14Pertemuan')),
        grades: getSheetDataAsJson(ss.getSheetByName('Nilai')),
        schedules: getSheetDataAsJson(ss.getSheetByName('JadwalKuliah')),
        users: getSheetDataAsJson(ss.getSheetByName('Pengguna')),
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'syncAll') {
      if (postData.students) saveJsonToSheet(ss.getSheetByName('Mahasiswa'), postData.students);
      if (postData.courses) saveJsonToSheet(ss.getSheetByName('MataKuliah'), postData.courses);
      if (postData.attendance) saveJsonToSheet(ss.getSheetByName('Absensi14Pertemuan'), postData.attendance);
      if (postData.grades) saveJsonToSheet(ss.getSheetByName('Nilai'), postData.grades);
      if (postData.schedules) saveJsonToSheet(ss.getSheetByName('JadwalKuliah'), postData.schedules);
      if (postData.users) saveJsonToSheet(ss.getSheetByName('Pengguna'), postData.users);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data Rekap Perkuliahan, Pengguna & Absensi Berhasil Disimpan ke Google Sheets!',
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
  const requiredSheets = ['Mahasiswa', 'MataKuliah', 'Absensi14Pertemuan', 'Nilai', 'JadwalKuliah', 'Pengguna'];
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
      const headerKey = String(headers[j]).trim();
      let val = row[j];
      
      // If cell is a Google Sheets Date Object
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
      }
      
      if (typeof val === 'string') {
        if (headerKey.toLowerCase() === 'courseids') {
          try {
            val = JSON.parse(val);
          } catch (e) {
            val = val.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
          }
        } else if (val.startsWith('{') || val.startsWith('[')) {
          try { val = JSON.parse(val); } catch (e) {}
        }
      }
      
      obj[headerKey] = val;
    }
    rows.push(obj);
  }
  return rows;
}

function getStandardHeaders(sheetName) {
  if (sheetName === 'Mahasiswa') {
    return ['id', 'nim', 'nama', 'prodi', 'angkatan', 'noHp', 'email', 'jenisKelamin', 'semester', 'courseIds'];
  }
  if (sheetName === 'MataKuliah') {
    return ['id', 'kode', 'nama', 'sks', 'semester', 'kelas', 'dosenPengampu', 'nipDosen', 'ruangan', 'jadwalHari', 'jamMulai', 'jamSelesai', 'minAttendancePercent', 'meetings', 'gradeWeights'];
  }
  if (sheetName === 'JadwalKuliah') {
    return ['id', 'courseId', 'namaMK', 'kodeMK', 'sks', 'hari', 'jamMulai', 'jamSelesai', 'ruangan', 'dosen', 'kelas', 'warna'];
  }
  if (sheetName === 'Absensi14Pertemuan') {
    return ['courseId', 'studentId', 'records'];
  }
  if (sheetName === 'Nilai') {
    return ['studentId', 'courseId', 'kehadiranManual', 'tugas', 'kuis', 'uts', 'uas', 'catatan'];
  }
  if (sheetName === 'Pengguna') {
    return ['id', 'username', 'password', 'nama', 'role', 'nipOrNim', 'email', 'prodi', 'dosenName', 'studentId', 'nim'];
  }
  return null;
}

function saveJsonToSheet(sheet, items) {
  if (!sheet) return;
  sheet.clear();
  if (!items || items.length === 0) return;
  
  const sheetName = sheet.getName();
  const standardHeaders = getStandardHeaders(sheetName);
  
  let headers = [];
  if (standardHeaders) {
    headers = standardHeaders;
  } else {
    const keySet = {};
    items.forEach(item => {
      Object.keys(item).forEach(k => { keySet[k] = true; });
    });
    headers = Object.keys(keySet);
  }
  if (headers.length === 0) return;

  const rows = [headers];
  
  items.forEach(item => {
    const row = headers.map(h => {
      let val = item[h];
      
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val !== undefined && val !== null ? String(val) : '';
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
