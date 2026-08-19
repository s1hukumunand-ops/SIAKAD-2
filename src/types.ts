export type AttendanceStatus = 'H' | 'I' | 'S' | 'A' | null;

export interface Student {
  id: string;
  nim: string;
  nama: string;
  prodi: string;
  angkatan: string;
  noHp: string;
  email: string;
  jenisKelamin: 'L' | 'P';
}

export interface MeetingInfo {
  meetingNumber: number; // 1 to 14
  date: string;
  topic: string;
  mode: 'Tatap Muka' | 'Daring' | 'Hybrid';
  dosenHadir: boolean;
  isCompleted?: boolean;
  notes?: string;
}

export interface Course {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: string; // e.g. "Ganjil 2024/2025"
  kelas: string; // e.g. "A", "B", "Reguler"
  dosenPengampu: string;
  nipDosen: string;
  ruangan: string;
  jadwalHari: string; // "Senin", "Selasa", etc.
  jamMulai: string; // "08:00"
  jamSelesai: string; // "10:30"
  minAttendancePercent: number; // default 75 (%)
  meetings: MeetingInfo[];
  gradeWeights: {
    kehadiran: number; // e.g. 10%
    tugas: number; // e.g. 20%
    kuis: number; // e.g. 10%
    uts: number; // e.g. 30%
    uas: number; // e.g. 30%
  };
}

export interface StudentAttendanceMap {
  // courseId -> studentId -> { [meetingNumber: 1..14]: AttendanceStatus }
  [courseId: string]: {
    [studentId: string]: Record<number, AttendanceStatus>;
  };
}

export interface StudentGrade {
  studentId: string;
  courseId: string;
  kehadiranManual?: number; // optional override, otherwise calculated from 14 meetings
  tugas: number; // 0 - 100
  kuis: number; // 0 - 100
  uts: number; // 0 - 100
  uas: number; // 0 - 100
  catatan?: string;
}

export interface StudentAttendanceSummary {
  student: Student;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  totalMeetingsHeld: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  maxAbsenceAllowed: number;
  remainingAbsence: number;
  isEligibleForExam: boolean;
  statusText: string;
}

export interface CalculatedGrade {
  student: Student;
  kehadiranScore: number;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
  nilaiAkhir: number; // 0 - 100
  hurufMutu: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E';
  angkaMutu: number; // 4.0, 3.75, 3.5, 3.0, 2.75, 2.5, 2.0, 1.0, 0
  statusKelulusan: 'LULUS' | 'TIDAK LULUS';
  isEligibleForExam: boolean;
}

export interface ScheduleItem {
  id: string;
  courseId: string;
  namaMK: string;
  kodeMK: string;
  sks: number;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  dosen: string;
  kelas: string;
  warna: string;
}

export interface GoogleSheetsSyncConfig {
  webAppUrl: string;
  sheetId: string;
  sheetName: string;
  lastSyncedAt: string | null;
  autoSync: boolean;
  status: 'idle' | 'testing' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}
