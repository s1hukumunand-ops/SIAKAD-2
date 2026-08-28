import { Student, Course, AttendanceStatus, StudentAttendanceSummary, CalculatedGrade, StudentGrade } from '../types';

/**
 * Filter students based on current Course and Semester
 */
export function getCourseStudents(students: Student[], course: Course | null | undefined, activeSemester?: string): Student[] {
  if (!students || students.length === 0 || !course) return [];

  // If activeSemester is active and course semester does not match, return empty
  if (activeSemester && activeSemester !== 'Semua Semester' && course.semester && course.semester !== activeSemester) {
    return [];
  }

  return students.filter((std) => {
    // If activeSemester is active and student has a semester that does not match, exclude
    if (activeSemester && activeSemester !== 'Semua Semester' && std.semester && std.semester !== activeSemester) {
      return false;
    }

    // 1. If student has explicit courseIds array, only include if enrolled in this course
    if (Array.isArray(std.courseIds) && std.courseIds.length > 0) {
      return std.courseIds.includes(course.id);
    }
    // 2. If student has single legacy courseId
    if ((std as any).courseId) {
      return (std as any).courseId === course.id;
    }
    return false;
  });
}

export function calculateAttendanceSummary(
  student: Student,
  course: Course,
  records: Record<number, AttendanceStatus> | undefined
): StudentAttendanceSummary {
  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let alpa = 0;

  // Check all 14 meetings
  for (let m = 1; m <= 14; m++) {
    const status = records?.[m];
    if (status === 'H') hadir++;
    else if (status === 'I') izin++;
    else if (status === 'S') sakit++;
    else if (status === 'A') alpa++;
  }

  // Count completed meetings in course safely
  const meetingsList = Array.isArray(course?.meetings) ? course.meetings : [];
  const completedMeetings = meetingsList.filter(m => m && m.isCompleted).length || 14;
  const totalMeetingsHeld = Math.max(1, completedMeetings);

  // In standard Indonesian universities, attendance percentage is usually:
  // (Hadir + (0.5 * (Izin + Sakit))) / Total or pure Hadir / Total.
  // Standard academic leeway
  const attendanceScore = hadir + (izin * 0.5) + (sakit * 0.5);
  const percentage = Math.min(100, Math.round((attendanceScore / totalMeetingsHeld) * 100));

  const minPercent = course?.minAttendancePercent || 75;
  // Maximum absence allowed across 14 meetings for 75% rule: 14 * 0.25 = 3.5 => 3 meetings maximum
  const maxAbsenceAllowed = Math.floor(14 * (1 - minPercent / 100));
  const remainingAbsence = Math.max(0, maxAbsenceAllowed - alpa);

  let status: 'safe' | 'warning' | 'critical' = 'safe';
  let isEligibleForExam = true;
  let statusText = 'Aman (Memenuhi Syarat)';

  if (alpa > maxAbsenceAllowed || percentage < minPercent) {
    status = 'critical';
    isEligibleForExam = false;
    statusText = 'Kritis (Terancam Dicekal UAS)';
  } else if (remainingAbsence <= 1 || percentage <= minPercent + 10) {
    status = 'warning';
    isEligibleForExam = true;
    statusText = 'Peringatan (Batas Kritis)';
  }

  return {
    student,
    hadir,
    izin,
    sakit,
    alpa,
    totalMeetingsHeld,
    percentage,
    status,
    maxAbsenceAllowed,
    remainingAbsence,
    isEligibleForExam,
    statusText,
  };
}

export function calculateGrade(
  student: Student,
  course: Course,
  gradeRecord: StudentGrade | undefined,
  attendanceSummary: StudentAttendanceSummary
): CalculatedGrade {
  const tugas = gradeRecord?.tugas ?? 0;
  const kuis = gradeRecord?.kuis ?? 0;
  const uts = gradeRecord?.uts ?? 0;
  const uas = gradeRecord?.uas ?? 0;

  // Kehadiran score (0-100)
  const kehadiranScore = gradeRecord?.kehadiranManual !== undefined
    ? gradeRecord.kehadiranManual
    : attendanceSummary.percentage;

  const weights = course.gradeWeights || {
    kehadiran: 10,
    tugas: 20,
    kuis: 10,
    uts: 30,
    uas: 30,
  };

  const totalWeight = weights.kehadiran + weights.tugas + weights.kuis + weights.uts + weights.uas;
  const normalizedWeight = totalWeight > 0 ? totalWeight : 100;

  const rawScore = (
    (kehadiranScore * weights.kehadiran) +
    (tugas * weights.tugas) +
    (kuis * weights.kuis) +
    (uts * weights.uts) +
    (uas * weights.uas)
  ) / normalizedWeight;

  const nilaiAkhir = Math.round(rawScore * 100) / 100;

  let hurufMutu: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E' = 'E';
  let angkaMutu = 0.0;

  if (nilaiAkhir >= 85) {
    hurufMutu = 'A';
    angkaMutu = 4.0;
  } else if (nilaiAkhir >= 80) {
    hurufMutu = 'A-';
    angkaMutu = 3.75;
  } else if (nilaiAkhir >= 75) {
    hurufMutu = 'B+';
    angkaMutu = 3.5;
  } else if (nilaiAkhir >= 70) {
    hurufMutu = 'B';
    angkaMutu = 3.0;
  } else if (nilaiAkhir >= 65) {
    hurufMutu = 'B-';
    angkaMutu = 2.75;
  } else if (nilaiAkhir >= 60) {
    hurufMutu = 'C+';
    angkaMutu = 2.25;
  } else if (nilaiAkhir >= 55) {
    hurufMutu = 'C';
    angkaMutu = 2.0;
  } else if (nilaiAkhir >= 45) {
    hurufMutu = 'D';
    angkaMutu = 1.0;
  } else {
    hurufMutu = 'E';
    angkaMutu = 0.0;
  }

  const isEligible = attendanceSummary.isEligibleForExam;
  const statusKelulusan = (isEligible && (hurufMutu !== 'D' && hurufMutu !== 'E'))
    ? 'LULUS'
    : 'TIDAK LULUS';

  return {
    student,
    kehadiranScore,
    tugas,
    kuis,
    uts,
    uas,
    nilaiAkhir,
    hurufMutu,
    angkaMutu,
    statusKelulusan,
    isEligibleForExam: isEligible,
  };
}

export function generateWarningWhatsAppMessage(
  student: Student,
  course: Course,
  summary: StudentAttendanceSummary
): string {
  const isCritical = summary.status === 'critical';
  const header = isCritical
    ? `⚠️ *PERINGATAN KRITIS KEHADIRAN KULIAH (PENCEKALAN UAS)*`
    : `📢 *INFORMASI & PERINGATAN REKAP KEHADIRAN KULIAH*`;

  const rawPhone = student?.noHp !== undefined && student?.noHp !== null ? String(student.noHp) : '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
      ? cleanPhone
      : cleanPhone ? '62' + cleanPhone : '';

  const studentName = student?.nama || 'Mahasiswa';
  const studentNim = student?.nim || '-';
  const studentProdi = student?.prodi || '-';

  const text = `${header}

Yth. Sdr/i *${studentName}*
NIM: *${studentNim}*
Program Studi: ${studentProdi}

Melalui pemberitahuan ini disampaikan rekapitulasi kehadiran Anda pada:
📚 *Mata Kuliah:* ${course?.nama || ''} (${course?.kode || ''})
👨‍🏫 *Dosen Pengampu:* ${course?.dosenPengampu || ''}
🗓️ *Kelas / Semester:* ${course?.kelas || ''} / ${course?.semester || ''}

📊 *Rincian Kehadiran (14 Pertemuan):*
- Hadir: ${summary.hadir} kali
- Izin: ${summary.izin} kali
- Sakit: ${summary.sakit} kali
- Alpa (Tanpa Keterangan): *${summary.alpa} kali*
- Persentase Kehadiran: *${summary.percentage}%* (Standar Minimal: ${course?.minAttendancePercent || 75}%)

${isCritical
  ? `❌ *STATUS: TIDAK MEMENUHI SYARAT KEHADIRAN (DICEKAL UAS)*
Jumlah alpa Anda telah melampaui batas maksimal (${summary.maxAbsenceAllowed} kali). Sesuai peraturan akademik, Anda *TIDAK DIPERBOLEHKAN* mengikuti Ujian Akhir Semester (UAS) kecuali segera melakukan klarifikasi ke Dosen Pengampu / Bagian Akademik.`
  : `⚠️ *STATUS: PERINGATAN (SISA JATAH ALPA: ${summary.remainingAbsence} KALI)*
Persentase kehadiran Anda mendekati batas minimal. Mohon memastikan kehadiran pada pertemuan selanjutnya agar tetap berhak mengikuti UAS.`
}

Terima kasih atas perhatian dan kerja samanya.
_Sistem Informasi Rekap Perkuliahan & Absensi_`;

  if (!formattedPhone) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export function formatBadgeClass(status: 'H' | 'I' | 'S' | 'A' | null): string {
  switch (status) {
    case 'H':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    case 'I':
      return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
    case 'S':
      return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    case 'A':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    default:
      return 'bg-slate-100 text-slate-400 border-slate-200';
  }
}

export function getStatusLabel(status: 'H' | 'I' | 'S' | 'A' | null): string {
  switch (status) {
    case 'H': return 'Hadir';
    case 'I': return 'Izin';
    case 'S': return 'Sakit';
    case 'A': return 'Alpa';
    default: return '-';
  }
}
