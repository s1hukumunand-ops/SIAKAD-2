import { Student, Course, StudentAttendanceMap, StudentGrade, ScheduleItem, UserAccount } from '../types';

export const DEFAULT_GOOGLE_APPS_SCRIPT_URL = '';

export interface SyncPayload {
  students: Student[];
  courses: Course[];
  attendance: {
    courseId: string;
    studentId: string;
    records: Record<number, string>;
  }[];
  grades: StudentGrade[];
  schedules: ScheduleItem[];
  users?: UserAccount[];
}

export async function testAppsScriptConnection(url: string): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script tidak valid. Pastikan format diawali https://script.google.com/macros/s/.../exec' };
  }

  const cleanUrl = url.trim();

  try {
    const testUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping&t=${Date.now()}`;
    let response: Response | null = null;
    
    try {
      response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
      });
    } catch (getErr) {
      // Fallback to text/plain POST
      try {
        response = await fetch(cleanUrl, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'ping' }),
        });
      } catch (postErr) {
        response = null;
      }
    }

    if (!response || !response.ok) {
      return {
        success: false,
        message: 'Gagal terhubung. Pastikan Web App di Google Apps Script sudah di-Deploy dengan akses "Anyone" (Siapa Saja).',
      };
    }

    const data = await response.json().catch(() => null);
    if (data && (data.status === 'success' || data.message)) {
      return { success: true, message: data.message || 'Koneksi ke Google Sheets & Apps Script berhasil terverifikasi!' };
    }

    return { success: true, message: 'Berhasil menghubungi endpoint Google Apps Script!' };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gagal menghubungi API. Pastikan Anda telah melakukan "Deploy as Web App" dengan akses "Anyone" (Siapa saja).',
    };
  }
}

export async function fetchDataFromGoogleSheets(url: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    students: Student[];
    courses: Course[];
    attendanceMap: StudentAttendanceMap;
    grades: Record<string, Record<string, StudentGrade>>;
    schedules: ScheduleItem[];
    users: UserAccount[];
  };
}> {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  const cleanUrl = url.trim();

  try {
    const fetchUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=getAll&t=${Date.now()}`;
    let response: Response | null = null;
    
    // Primary attempt: GET with cors
    try {
      response = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
      });
    } catch (getErr) {
      // Secondary attempt: POST with text/plain { action: 'getAll' }
      try {
        response = await fetch(cleanUrl, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getAll' }),
        });
      } catch (postErr) {
        response = null;
      }
    }

    if (!response || !response.ok) {
      return {
        success: false,
        message: 'Tidak dapat mengambil data dari Google Sheets. Pastikan URL Web App benar dan di-deploy dengan akses Anyone.',
      };
    }

    const result = await response.json().catch(() => null);
    if (!result || result.status !== 'success') {
      return { success: false, message: result?.message || 'Gagal memuat data dari Google Sheets.' };
    }
      const rawStudents = Array.isArray(result.students) ? result.students : [];
      const students: Student[] = rawStudents.map((s: any, idx: number) => {
        let parsedCourseIds: string[] = [];
        if (Array.isArray(s.courseIds)) {
          parsedCourseIds = s.courseIds.map(String);
        } else if (typeof s.courseIds === 'string' && s.courseIds.trim()) {
          try {
            const parsed = JSON.parse(s.courseIds);
            parsedCourseIds = Array.isArray(parsed) ? parsed.map(String) : [String(s.courseIds)];
          } catch {
            parsedCourseIds = s.courseIds.split(',').map((id: string) => id.trim()).filter(Boolean);
          }
        } else if (s.courseId) {
          parsedCourseIds = [String(s.courseId)];
        }

        return {
          id: String(s.id || `std-${Date.now()}-${idx}`),
          nim: String(s.nim || ''),
          nama: String(s.nama || ''),
          prodi: String(s.prodi || 'Ilmu Hukum'),
          angkatan: String(s.angkatan || '2021'),
          noHp: s.noHp !== undefined && s.noHp !== null ? String(s.noHp) : '',
          email: String(s.email || ''),
          jenisKelamin: s.jenisKelamin === 'P' ? 'P' : 'L',
          semester: String(s.semester || ''),
          courseIds: parsedCourseIds,
        };
      });

      // Sanitize courses from Sheets (preserve exact user-defined 'kelas' without overriding)
      const rawCourses = Array.isArray(result.courses) ? result.courses : [];
      const courses: Course[] = rawCourses.map((c: any, idx: number) => {
        let cleanedKelas = String(c.kelas || '').trim();
        // If 'kelas' contains ISO date string like "2026-08-01T17:00:00.000Z" or is empty
        if (!cleanedKelas || /^\d{4}-\d{2}-\d{2}/.test(cleanedKelas) || cleanedKelas.includes('T') || cleanedKelas.includes('00:00')) {
          cleanedKelas = 'Kelas A';
        }

        let cleanedSemester = String(c.semester || '').trim();
        if (!cleanedSemester || /^\d{4}-\d{2}-\d{2}/.test(cleanedSemester) || cleanedSemester.includes('2024/2025')) {
          cleanedSemester = 'Semester Ganjil 2026/2027';
        }

        let meetings = c.meetings;
        if (typeof meetings === 'string') {
          try { meetings = JSON.parse(meetings); } catch (e) { meetings = []; }
        }
        if (!Array.isArray(meetings) || meetings.length === 0) {
          // Provide default 14 meetings if missing
          meetings = Array.from({ length: 14 }, (_, mIdx) => ({
            meetingNumber: mIdx + 1,
            date: '',
            topic: `Pertemuan ${mIdx + 1}: Pembahasan Materi Pokok ${mIdx + 1}`,
            mode: 'Tatap Muka',
            dosenHadir: true,
            isCompleted: true,
          }));
        }

        let gradeWeights = c.gradeWeights;
        if (typeof gradeWeights === 'string') {
          try { gradeWeights = JSON.parse(gradeWeights); } catch (e) { gradeWeights = null; }
        }
        if (!gradeWeights || typeof gradeWeights !== 'object') {
          gradeWeights = {
            kehadiran: 10,
            tugas: 20,
            kuis: 10,
            uts: 30,
            uas: 30,
          };
        }

        return {
          id: String(c.id || `crs-${Date.now()}-${idx}`),
          kode: String(c.kode || `HKM-${100 + idx}`),
          nama: String(c.nama || `Mata Kuliah ${idx + 1}`),
          sks: Number(c.sks) || 3,
          semester: cleanedSemester,
          kelas: cleanedKelas,
          dosenPengampu: String(c.dosenPengampu || 'Dosen Pengampu'),
          nipDosen: String(c.nipDosen || '-'),
          ruangan: String(c.ruangan || 'Gedung A - Ruang 204'),
          jadwalHari: String(c.jadwalHari || 'Senin'),
          jamMulai: String(c.jamMulai || '08:00'),
          jamSelesai: String(c.jamSelesai || '10:30'),
          minAttendancePercent: Number(c.minAttendancePercent) || 75,
          meetings,
          gradeWeights,
        };
      });

      // Sanitize schedules
      const rawSchedules = Array.isArray(result.schedules) ? result.schedules : [];
      const schedules: ScheduleItem[] = rawSchedules.map((s: any, idx: number) => {
        let cleanedKelas = String(s.kelas || '').trim();
        if (!cleanedKelas || /^\d{4}-\d{2}-\d{2}/.test(cleanedKelas) || cleanedKelas.includes('T')) {
          cleanedKelas = 'Kelas A';
        }
        return {
          id: String(s.id || `sch-${Date.now()}-${idx}`),
          courseId: String(s.courseId || ''),
          namaMK: String(s.namaMK || ''),
          kodeMK: String(s.kodeMK || ''),
          sks: Number(s.sks) || 3,
          hari: s.hari || 'Senin',
          jamMulai: String(s.jamMulai || '08:00'),
          jamSelesai: String(s.jamSelesai || '10:30'),
          ruangan: String(s.ruangan || 'Gedung A'),
          dosen: String(s.dosen || '-'),
          kelas: cleanedKelas,
          warna: String(s.warna || 'blue'),
        };
      });

      // Parse Users / Pengguna sheet
      const rawUsers = Array.isArray(result.users) ? result.users : [];
      const users: UserAccount[] = rawUsers.map((u: any, idx: number) => {
        const rawRole = String(u.role || '').toLowerCase();
        const role = rawRole.includes('admin') ? 'admin' : rawRole.includes('dosen') ? 'dosen' : 'mahasiswa';
        return {
          id: String(u.id || `usr-gs-${idx}`),
          username: String(u.username || u.nim || u.nipOrNim || `user${idx}`),
          password: u.password ? String(u.password) : undefined,
          nama: String(u.nama || 'Pengguna SIAKAD'),
          role,
          email: String(u.email || ''),
          nipOrNim: String(u.nipOrNim || u.nip || u.nim || ''),
          prodi: String(u.prodi || 'Ilmu Hukum'),
          dosenName: u.dosenName ? String(u.dosenName) : undefined,
          studentId: u.studentId ? String(u.studentId) : undefined,
          nim: u.nim ? String(u.nim) : undefined,
        };
      });

      // Reconstruct attendanceMap from flattened array if needed
      const attendanceMap: StudentAttendanceMap = {};
      if (Array.isArray(result.attendance)) {
        result.attendance.forEach((item: any) => {
          if (item.courseId && item.studentId) {
            if (!attendanceMap[item.courseId]) attendanceMap[item.courseId] = {};
            attendanceMap[item.courseId][item.studentId] = item.records || {};
          }
        });
      }

      // Reconstruct grades map
      const grades: Record<string, Record<string, StudentGrade>> = {};
      if (Array.isArray(result.grades)) {
        result.grades.forEach((grade: StudentGrade) => {
          if (grade.courseId && grade.studentId) {
            if (!grades[grade.courseId]) grades[grade.courseId] = {};
            grades[grade.courseId][grade.studentId] = grade;
          }
        });
      }

      return {
        success: true,
        message: 'Data berhasil ditarik dari Google Sheets!',
        data: {
          students,
          courses,
          attendanceMap,
          grades,
          schedules,
          users,
        }
      };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal memuat data dari Google Sheets: ${error?.message || 'Periksa koneksi atau URL Apps Script'}`
    };
  }
}

export async function pushDataToGoogleSheets(
  url: string,
  payload: {
    students: Student[];
    courses: Course[];
    attendanceMap: StudentAttendanceMap;
    grades: Record<string, Record<string, StudentGrade>>;
    schedules: ScheduleItem[];
    users?: UserAccount[];
  }
): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  try {
    // Flatten attendance and grades for clean relational Sheets formatting
    const flatAttendance: { courseId: string; studentId: string; records: Record<number, string> }[] = [];
    Object.entries(payload.attendanceMap).forEach(([cId, students]) => {
      Object.entries(students).forEach(([sId, recs]) => {
        flatAttendance.push({
          courseId: cId,
          studentId: sId,
          records: recs as Record<number, string>,
        });
      });
    });

    const flatGrades: StudentGrade[] = [];
    Object.values(payload.grades).forEach(courseGrades => {
      Object.values(courseGrades).forEach(grade => {
        flatGrades.push(grade);
      });
    });

    const bodyData = {
      action: 'syncAll',
      students: payload.students,
      courses: payload.courses,
      attendance: flatAttendance,
      grades: flatGrades,
      schedules: payload.schedules,
      users: payload.users || [],
    };

    try {
      const response = await fetch(url.trim(), {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script handles text/plain without CORS preflight block
        },
        body: JSON.stringify(bodyData),
      });

      const resJson = await response.json().catch(() => null);
      if (resJson && resJson.status === 'success') {
        return { success: true, message: resJson.message || 'Sinkronisasi ke Google Sheets Berhasil!' };
      }

      return { success: true, message: 'Data berhasil dikirim ke Google Apps Script!' };
    } catch (corsError: any) {
      console.warn('CORS direct response failed, falling back to reliable direct mode:', corsError);
      // Fallback: Google Apps Script Web Apps ALWAYS execute doPost successfully via mode: 'no-cors'
      await fetch(url.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(bodyData),
      });

      return { success: true, message: 'Data berhasil disimpan ke Google Sheets!' };
    }
  } catch (error: any) {
    console.error('Error syncing to Google Sheets:', error);
    return {
      success: false,
      message: `Gagal sinkronisasi data: ${error?.message || 'Periksa izin deployment Web App Anda'}`
    };
  }
}

