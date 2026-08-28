export const SEMESTER_OPTIONS = [
  'Semester Ganjil 2026/2027',
  'Semester Genap 2026/2027',
  'Semester Ganjil 2027/2028',
  'Semester Genap 2027/2028',
  'Semester Ganjil 2025/2026',
  'Semester Genap 2025/2026',
] as const;

export const DEFAULT_ACTIVE_SEMESTER = 'Semester Ganjil 2026/2027';

export const DAYS_INDO = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

const DAY_MAP: Record<string, number> = {
  'Minggu': 0,
  'Senin': 1,
  'Selasa': 2,
  'Rabu': 3,
  'Kamis': 4,
  'Jumat': 5,
  'Sabtu': 6,
};

/**
 * Returns default starting date (YYYY-MM-DD) for a given day in the selected semester.
 * For Ganjil 2026/2027, starts in September 2026.
 */
export function getDefaultStartDateForSemester(dayName: string, semesterName: string = DEFAULT_ACTIVE_SEMESTER): string {
  const targetDayIndex = DAY_MAP[dayName] !== undefined ? DAY_MAP[dayName] : 1; // default Senin

  let year = 2026;
  let month = 8; // September (0-indexed)

  if (semesterName.toLowerCase().includes('genap')) {
    if (semesterName.includes('2026/2027')) {
      year = 2027;
      month = 1; // February
    } else if (semesterName.includes('2027/2028')) {
      year = 2028;
      month = 1;
    } else if (semesterName.includes('2025/2026')) {
      year = 2026;
      month = 1;
    }
  } else {
    // Ganjil
    if (semesterName.includes('2026/2027')) {
      year = 2026;
      month = 8; // September 2026
    } else if (semesterName.includes('2027/2028')) {
      year = 2027;
      month = 8; // September 2027
    } else if (semesterName.includes('2025/2026')) {
      year = 2025;
      month = 8; // September 2025
    }
  }

  // Find the first day of that month that matches targetDayIndex
  const date = new Date(year, month, 1);
  while (date.getDay() !== targetDayIndex) {
    date.setDate(date.getDate() + 1);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates an array of consecutive weekly dates (+7 days each) for 14 meetings.
 */
export function generateConsecutiveMeetingDates(startDateStr: string, totalMeetings: number = 14): string[] {
  if (!startDateStr) return Array(totalMeetings).fill('');
  
  const [yStr, mStr, dStr] = startDateStr.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const d = parseInt(dStr, 10);

  if (isNaN(y) || isNaN(m) || isNaN(d)) {
    return Array(totalMeetings).fill('');
  }

  const result: string[] = [];
  const baseDate = new Date(y, m, d);

  for (let i = 0; i < totalMeetings; i++) {
    const cur = new Date(baseDate);
    cur.setDate(baseDate.getDate() + (i * 7));
    
    const curYear = cur.getFullYear();
    const curMonth = String(cur.getMonth() + 1).padStart(2, '0');
    const curDay = String(cur.getDate()).padStart(2, '0');
    result.push(`${curYear}-${curMonth}-${curDay}`);
  }

  return result;
}

/**
 * Format a YYYY-MM-DD date string to localized Indonesian format (e.g., "Senin, 07 Sep 2026")
 */
export function formatIndoDate(dateStr?: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr || '-';
  try {
    const [yStr, mStr, dStr] = dateStr.split('-');
    const date = new Date(parseInt(yStr), parseInt(mStr) - 1, parseInt(dStr));
    if (isNaN(date.getTime())) return dateStr;

    const dayName = DAYS_INDO[date.getDay()];
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = monthsShort[date.getMonth()];
    return `${dayName}, ${String(date.getDate()).padStart(2, '0')} ${monthName} ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Generate standard 14 meetings topics & dates for a course.
 */
export function generateDefault14Meetings(
  startDateStr: string,
  courseName: string = ''
) {
  const dates = generateConsecutiveMeetingDates(startDateStr, 14);

  const defaultTopics = [
    `Kontrak Perkuliahan, Rencana Pembelajaran Semester (RPS) & Pengantar ${courseName || 'Mata Kuliah'}`,
    'Landasan Konseptual, Asas-Asas Pokok & Teori Dasar',
    'Ruang Lingkup Materi & Kerangka Yuridis / Pembahasan Pokok I',
    'Analisis Regulasi, Studi Dokumen & Pembahasan Pokok II',
    'Pendalaman Materi & Diskusi Isu Kontemporer (Daring)',
    'Kajian Kasus Praktik, Analisis Putusan & Problem Solving',
    'Review Komprehensif Pra-UTS & Diskusi Terbimbing',
    'Pelaksanaan Ujian Tengah Semester (UTS)',
    'Evaluasi Hasil UTS & Pendalaman Pokok Bahasan Lanjutan',
    'Aplikasi Praktis, Praktik Penegakan / Penerapan di Lapangan',
    'Analisis Kebijakan Strategis & Studi Perbandingan (Hybrid)',
    'Presentasi Makalah Kelompok & Forum Diskusi Interaktif',
    'Kapita Selekta, Tantangan Masa Depan & Reformasi Kebijakan',
    'Review Akhir Semester, Evaluasi Capaian Pembelajaran & Kesiapan UAS',
  ];

  return Array.from({ length: 14 }, (_, i) => ({
    meetingNumber: i + 1,
    date: dates[i] || '',
    topic: defaultTopics[i] || `Pokok Bahasan Pertemuan ${i + 1}`,
    mode: (i === 4 ? 'Daring' : i === 10 ? 'Hybrid' : 'Tatap Muka') as 'Tatap Muka' | 'Daring' | 'Hybrid',
    dosenHadir: true,
    isCompleted: false,
  }));
}
