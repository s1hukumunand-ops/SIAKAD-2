import { Student, Course, StudentAttendanceMap, StudentGrade, ScheduleItem } from '../types';

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
}

export async function testAppsScriptConnection(url: string): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script tidak valid. Pastikan format diawali https://script.google.com/macros/s/.../exec' };
  }

  try {
    const testUrl = `${url.trim()}?action=ping`;
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status === 'success' || data.message) {
      return { success: true, message: data.message || 'Koneksi ke Google Sheets & Apps Script berhasil terverifikasi!' };
    }

    return { success: true, message: 'Berhasil menghubungi endpoint Google Apps Script!' };
  } catch (error: any) {
    console.warn('Apps Script direct GET error:', error);
    // Google Apps Script redirects might face standard browser CORS if executed without JSONP or direct CORS,
    // Provide actionable diagnostic help:
    return {
      success: false,
      message: error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')
        ? 'Gagal menghubungi API. Pastikan Anda telah melakukan "Deploy as Web App" dengan akses "Anyone" (Siapa saja).'
        : `Gagal terhubung: ${error?.message || 'Error tidak diketahui'}`
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
    };

    const response = await fetch(url.trim(), {
      method: 'POST',
      mode: 'cors',
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
  } catch (error: any) {
    console.error('Error syncing to Google Sheets:', error);
    return {
      success: false,
      message: `Gagal sinkronisasi data: ${error?.message || 'Periksa izin deployment Web App Anda'}`
    };
  }
}
