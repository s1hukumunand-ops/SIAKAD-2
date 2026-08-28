import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Course, 
  Student, 
  StudentAttendanceMap, 
  StudentGrade, 
  ScheduleItem, 
  GoogleSheetsSyncConfig, 
  MeetingInfo,
  AttendanceStatus,
  UserAccount,
  AuthUser 
} from './types';
import { 
  initialStudents, 
  initialCourses, 
  initialAttendanceMap, 
  initialGrades, 
  initialSchedules,
  demoStudents,
  demoCourses,
  demoAttendanceMap,
  demoGrades,
  demoSchedules
} from './data/initialData';
import { calculateAttendanceSummary } from './utils/calculations';
import { DEFAULT_ACTIVE_SEMESTER } from './utils/dateUtils';
import { 
  pushDataToGoogleSheets, 
  fetchDataFromGoogleSheets, 
  DEFAULT_GOOGLE_APPS_SCRIPT_URL 
} from './services/googleSheetService';

// Components
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { AttendanceTab } from './components/AttendanceTab';
import { GradesTab } from './components/GradesTab';
import { ScheduleTab } from './components/ScheduleTab';
import { WarningSystemTab } from './components/WarningSystemTab';
import { GoogleSheetIntegrationTab } from './components/GoogleSheetIntegrationTab';
import { ReportExportModal } from './components/ReportExportModal';
import { StudentModal } from './components/StudentModal';
import { CourseModal } from './components/CourseModal';
import { MeetingEditModal } from './components/MeetingEditModal';
import { ResetDataModal } from './components/ResetDataModal';
import { CourseSearchCommandModal } from './components/CourseSearchCommandModal';
import { LoginModal } from './components/LoginModal';
import { StudentPortalView } from './components/StudentPortalView';
import { ADMIN_USER, isCourseTaughtByDosen, getAllUserAccounts } from './utils/authData';
import { CheckCircle2, RefreshCw, AlertCircle, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

export default function App() {
  // Authentication & Multi-Login User Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('siakad_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ADMIN_USER; // Default to Admin
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('siakad_user_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('siakad_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('siakad_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('siakad_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  // State Initialization with LocalStorage Persistence
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('siakad_courses');
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const saved = localStorage.getItem('siakad_selected_course');
    return saved || (initialCourses[0]?.id || '');
  });

  const [activeSemester, setActiveSemester] = useState<string>(() => {
    const saved = localStorage.getItem('siakad_active_semester');
    return saved || DEFAULT_ACTIVE_SEMESTER;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('siakad_students');
    if (!saved) return initialStudents;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((s: any, idx: number) => {
          let courseIds = s.courseIds;
          if (typeof courseIds === 'string') {
            try {
              courseIds = JSON.parse(courseIds);
            } catch {
              courseIds = courseIds.split(',').map((x: string) => x.trim()).filter(Boolean);
            }
          }
          if (!Array.isArray(courseIds)) {
            courseIds = s.courseId ? [String(s.courseId)] : [];
          }

          return {
            id: String(s.id || `std-${idx}`),
            nim: String(s.nim || ''),
            nama: String(s.nama || ''),
            prodi: String(s.prodi || 'Ilmu Hukum'),
            angkatan: String(s.angkatan || '2021'),
            noHp: s.noHp !== undefined && s.noHp !== null ? String(s.noHp) : '',
            email: String(s.email || ''),
            jenisKelamin: s.jenisKelamin === 'P' ? 'P' : 'L',
            semester: String(s.semester || ''),
            courseIds: courseIds.map(String),
          };
        });
      }
    } catch (e) {
      console.warn('Error reading saved students:', e);
    }
    return initialStudents;
  });

  const [attendanceMap, setAttendanceMap] = useState<StudentAttendanceMap>(() => {
    const saved = localStorage.getItem('siakad_attendance');
    return saved ? JSON.parse(saved) : initialAttendanceMap;
  });

  const [grades, setGrades] = useState<Record<string, Record<string, StudentGrade>>>(() => {
    const saved = localStorage.getItem('siakad_grades');
    return saved ? JSON.parse(saved) : initialGrades;
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('siakad_schedules');
    return saved ? JSON.parse(saved) : initialSchedules;
  });

  const [googleConfig, setGoogleConfig] = useState<GoogleSheetsSyncConfig>(() => {
    const saved = localStorage.getItem('siakad_google_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          webAppUrl: parsed.webAppUrl && parsed.webAppUrl.trim() !== '' ? parsed.webAppUrl : DEFAULT_GOOGLE_APPS_SCRIPT_URL,
          status: parsed.status === 'error' ? 'idle' : parsed.status || 'success',
        };
      } catch (e) {}
    }
    return {
      webAppUrl: DEFAULT_GOOGLE_APPS_SCRIPT_URL,
      sheetId: '',
      sheetName: 'RekapPerkuliahan',
      lastSyncedAt: null,
      autoSync: true,
      status: 'idle',
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'grades' | 'schedule' | 'warning' | 'googlesheets' | 'report'>('dashboard');

  // Modals & UI Controls
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingInfo | null>(null);

  // Pinned / Favorite courses for quick access in 400+ courses database
  const [pinnedCourseIds, setPinnedCourseIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('siakad_pinned_courses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('siakad_pinned_courses', JSON.stringify(pinnedCourseIds));
  }, [pinnedCourseIds]);

  const handleTogglePinCourse = (courseId: string) => {
    setPinnedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Global keyboard shortcut Ctrl+K / Cmd+K to open 400+ course search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state & Notification toast
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showSyncNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSyncToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setSyncToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Push latest state to Google Sheets immediately
  const pushCurrentStateToSheets = async (overrides?: {
    students?: Student[];
    courses?: Course[];
    attendanceMap?: StudentAttendanceMap;
    grades?: Record<string, Record<string, StudentGrade>>;
    schedules?: ScheduleItem[];
    users?: UserAccount[];
  }) => {
    const targetUrl = googleConfig.webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
    if (!targetUrl || !targetUrl.startsWith('http')) return;

    setIsSyncing(true);
    try {
      const activeUsers = getAllUserAccounts(
        overrides?.courses ?? courses,
        overrides?.students ?? students,
        userAccounts
      );

      const result = await pushDataToGoogleSheets(targetUrl, {
        students: overrides?.students ?? students,
        courses: overrides?.courses ?? courses,
        attendanceMap: overrides?.attendanceMap ?? attendanceMap,
        grades: overrides?.grades ?? grades,
        schedules: overrides?.schedules ?? schedules,
        users: overrides?.users ?? activeUsers,
      });

      setIsSyncing(false);
      if (result.success) {
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setGoogleConfig((prev) => ({
          ...prev,
          status: 'success',
          lastSyncedAt: timeStr,
          errorMessage: undefined,
        }));
        showSyncNotification('Tersimpan di Google Sheets ✓', 'success');
      } else {
        setGoogleConfig((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: result.message,
        }));
      }
    } catch (err: any) {
      setIsSyncing(false);
      console.warn('Auto sync error:', err);
    }
  };

  // Debounced auto-sync for frequent edits (like attendance checkboxes and grade inputs)
  const debouncedSync = (overrides?: {
    students?: Student[];
    courses?: Course[];
    attendanceMap?: StudentAttendanceMap;
    grades?: Record<string, Record<string, StudentGrade>>;
    schedules?: ScheduleItem[];
  }) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      pushCurrentStateToSheets(overrides);
    }, 800);
  };

  // Auto-Fetch data from Google Sheets on application initial load
  useEffect(() => {
    const targetUrl = googleConfig.webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
    if (targetUrl && targetUrl.startsWith('http')) {
      fetchDataFromGoogleSheets(targetUrl)
        .then((result) => {
          if (result.success && result.data) {
            const hasRemoteData = 
              (result.data.students && result.data.students.length > 0) ||
              (result.data.schedules && result.data.schedules.length > 0) ||
              (result.data.courses && result.data.courses.length > 0);

            if (hasRemoteData) {
              if (result.data.students) {
                setStudents(result.data.students);
              }
              if (result.data.courses && result.data.courses.length > 0) {
                setCourses(result.data.courses);
                setSelectedCourseId((prev) => {
                  const exists = result.data?.courses.some((c) => c.id === prev);
                  return exists ? prev : result.data?.courses[0].id || prev;
                });
              }
              if (result.data.attendanceMap) {
                setAttendanceMap(result.data.attendanceMap);
              }
              if (result.data.grades) {
                setGrades(result.data.grades);
              }
              if (result.data.schedules && result.data.schedules.length > 0) {
                setSchedules(result.data.schedules);
              }
              if (result.data.users && result.data.users.length > 0) {
                setUserAccounts(result.data.users);
              }
            } else {
              // If Sheets is empty, check if we have local student or schedule data to seed
              const savedStudents = localStorage.getItem('siakad_students');
              const savedSchedules = localStorage.getItem('siakad_schedules');
              const localStudents = savedStudents ? JSON.parse(savedStudents) : [];
              const localSchedules = savedSchedules ? JSON.parse(savedSchedules) : [];
              if (localStudents.length > 0 || localSchedules.length > 0) {
                pushDataToGoogleSheets(targetUrl, {
                  students: localStudents,
                  courses,
                  attendanceMap,
                  grades,
                  schedules: localSchedules,
                  users: getAllUserAccounts(courses, localStudents, userAccounts),
                });
              }
            }

            const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setGoogleConfig((prev) => ({
              ...prev,
              webAppUrl: targetUrl,
              status: 'success',
              lastSyncedAt: timeStr,
              errorMessage: undefined,
            }));
          } else {
            setGoogleConfig((prev) => ({
              ...prev,
              webAppUrl: targetUrl,
              status: 'success',
            }));
          }
        })
        .catch((err) => {
          console.log('Initial Google Sheets sync check:', err);
        });
    }
  }, []);

  // Save to LocalStorage on Changes
  useEffect(() => {
    localStorage.setItem('siakad_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('siakad_selected_course', selectedCourseId);
  }, [selectedCourseId]);

  useEffect(() => {
    localStorage.setItem('siakad_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('siakad_attendance', JSON.stringify(attendanceMap));
  }, [attendanceMap]);

  useEffect(() => {
    localStorage.setItem('siakad_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('siakad_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('siakad_google_config', JSON.stringify(googleConfig));
  }, [googleConfig]);

  // Filter courses based on user role (Dosen sees ONLY their courses; Mahasiswa sees enrolled courses; Admin sees all)
  const effectiveCourses = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin') return courses;
    if (currentUser.role === 'dosen') {
      return courses.filter((c) => isCourseTaughtByDosen(c, currentUser));
    }
    if (currentUser.role === 'mahasiswa') {
      const student = students.find((s) => s.nim === currentUser.nipOrNim || s.id === currentUser.studentId);
      if (student && Array.isArray(student.courseIds) && student.courseIds.length > 0) {
        return courses.filter((c) => student.courseIds.includes(c.id));
      }
      return courses.slice(0, 8);
    }
    return courses;
  }, [courses, currentUser, students]);

  const effectiveSchedules = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin') return schedules;
    if (currentUser.role === 'dosen') {
      return schedules.filter((s) => {
        const matchCourse = effectiveCourses.some((c) => c.id === s.courseId || c.kode === s.kodeMK);
        if (matchCourse) return true;
        if (currentUser.dosenName && s.dosen.toLowerCase().includes(currentUser.dosenName.toLowerCase())) return true;
        return false;
      });
    }
    if (currentUser.role === 'mahasiswa') {
      return schedules.filter((s) => effectiveCourses.some((c) => c.id === s.courseId || c.kode === s.kodeMK));
    }
    return schedules;
  }, [schedules, currentUser, effectiveCourses]);

  // Current active courses in semester
  const semesterCourses = useMemo(() => {
    if (!activeSemester || activeSemester === 'Semua Semester') return effectiveCourses;
    return effectiveCourses.filter((c) => c.semester === activeSemester);
  }, [effectiveCourses, activeSemester]);

  // Current Course - adheres to selected semester and effective courses
  const currentCourse = useMemo(() => {
    const matching = effectiveCourses.find((c) => c.id === selectedCourseId);
    if (matching && (!activeSemester || activeSemester === 'Semua Semester' || matching.semester === activeSemester)) {
      return matching;
    }
    return semesterCourses[0] || (activeSemester === 'Semua Semester' ? effectiveCourses[0] : null);
  }, [effectiveCourses, selectedCourseId, activeSemester, semesterCourses]);

  // Critical Attendance Warning Count for active course
  const currentCourseAttendance = currentCourse ? attendanceMap[currentCourse.id] || {} : {};
  const warningCount = currentCourse
    ? students.filter((s) => {
        const summary = calculateAttendanceSummary(s, currentCourse, currentCourseAttendance[s.id]);
        return summary.status === 'critical';
      }).length
    : 0;

  // Handlers for Attendance
  const handleUpdateAttendance = (studentId: string, meetingNum: number, status: AttendanceStatus) => {
    if (!currentCourse) return;

    const courseAtt = { ...(attendanceMap[currentCourse.id] || {}) };
    const studentRecs = { ...(courseAtt[studentId] || {}) };

    if (status === null) {
      delete studentRecs[meetingNum];
    } else {
      studentRecs[meetingNum] = status;
    }

    courseAtt[studentId] = studentRecs;
    const updatedMap = {
      ...attendanceMap,
      [currentCourse.id]: courseAtt,
    };

    setAttendanceMap(updatedMap);
    debouncedSync({ attendanceMap: updatedMap });
  };

  const handleBulkUpdateAttendance = (meetingNum: number, status: AttendanceStatus) => {
    if (!currentCourse) return;

    const courseAtt = { ...(attendanceMap[currentCourse.id] || {}) };

    students.forEach((std) => {
      const studentRecs = { ...(courseAtt[std.id] || {}) };
      if (status === null) {
        delete studentRecs[meetingNum];
      } else {
        studentRecs[meetingNum] = status;
      }
      courseAtt[std.id] = studentRecs;
    });

    const updatedMap = {
      ...attendanceMap,
      [currentCourse.id]: courseAtt,
    };

    setAttendanceMap(updatedMap);
    pushCurrentStateToSheets({ attendanceMap: updatedMap });
  };

  // Handler for changing active semester with automatic course selection
  const handleSelectSemester = (newSemester: string) => {
    setActiveSemester(newSemester);
    const matchingCourses = newSemester === 'Semua Semester'
      ? courses
      : courses.filter((c) => c.semester === newSemester);

    if (matchingCourses.length > 0) {
      const isCurrentInSemester = matchingCourses.some((c) => c.id === selectedCourseId);
      if (!isCurrentInSemester) {
        setSelectedCourseId(matchingCourses[0].id);
      }
    }
  };

  // Save activeSemester to local storage
  useEffect(() => {
    localStorage.setItem('siakad_active_semester', activeSemester);
  }, [activeSemester]);

  // Handler for Meeting topic/date edit (supports single or auto-shifted batch)
  const handleSaveMeeting = (updatedMeeting: MeetingInfo, updatedAllMeetings?: MeetingInfo[]) => {
    if (!currentCourse) return;

    const updatedCourses = courses.map((c) => {
      if (c.id !== currentCourse.id) return c;
      if (updatedAllMeetings && updatedAllMeetings.length > 0) {
        return {
          ...c,
          meetings: updatedAllMeetings,
        };
      }
      const updatedMeetings = c.meetings.map((m) =>
        m.meetingNumber === updatedMeeting.meetingNumber ? updatedMeeting : m
      );
      return {
        ...c,
        meetings: updatedMeetings,
      };
    });

    setCourses(updatedCourses);
    pushCurrentStateToSheets({ courses: updatedCourses });
    showSyncNotification('Topik & Tanggal Pertemuan berhasil diperbarui');
  };

  // Handler for batch updating all 14 meeting dates
  const handleBatchUpdateMeetings = (updatedMeetings: MeetingInfo[]) => {
    if (!currentCourse) return;

    const updatedCourses = courses.map((c) => {
      if (c.id !== currentCourse.id) return c;
      return {
        ...c,
        meetings: updatedMeetings,
      };
    });

    setCourses(updatedCourses);
    pushCurrentStateToSheets({ courses: updatedCourses });
    showSyncNotification('Jadwal 14 Pertemuan berhasil disinkronkan');
  };

  // Handler for Grades
  const handleUpdateGrade = (studentId: string, updatedField: Partial<StudentGrade>) => {
    if (!currentCourse) return;

    const courseGrd = { ...(grades[currentCourse.id] || {}) };
    const existing = courseGrd[studentId] || {
      studentId,
      courseId: currentCourse.id,
      tugas: 0,
      kuis: 0,
      uts: 0,
      uas: 0,
    };

    courseGrd[studentId] = {
      ...existing,
      ...updatedField,
    };

    const updatedGrades = {
      ...grades,
      [currentCourse.id]: courseGrd,
    };

    setGrades(updatedGrades);
    debouncedSync({ grades: updatedGrades });
  };

  // Handler for Grade Weights
  const handleUpdateWeights = (newWeights: Course['gradeWeights']) => {
    if (!currentCourse) return;

    const updatedCourses = courses.map((c) => (c.id === currentCourse.id ? { ...c, gradeWeights: newWeights } : c));
    setCourses(updatedCourses);
    pushCurrentStateToSheets({ courses: updatedCourses });
  };

  // Handler for Min Attendance Percent
  const handleUpdateMinAttendance = (minPercent: number) => {
    if (!currentCourse) return;

    const updatedCourses = courses.map((c) => (c.id === currentCourse.id ? { ...c, minAttendancePercent: minPercent } : c));
    setCourses(updatedCourses);
    pushCurrentStateToSheets({ courses: updatedCourses });
  };

  // Add new student (Immediately pushes to Google Sheets)
  const handleAddStudent = async (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `std-${Date.now()}`,
    };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    showSyncNotification(`Mahasiswa ${newStudent.nama} berhasil ditambahkan!`, 'success');
    await pushCurrentStateToSheets({ students: updatedStudents });
  };

  // Update existing student
  const handleUpdateStudent = async (updatedStudent: Student) => {
    const updatedStudents = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updatedStudents);
    showSyncNotification(`Data mahasiswa ${updatedStudent.nama} berhasil diperbarui!`, 'success');
    await pushCurrentStateToSheets({ students: updatedStudents });
  };

  // Delete student with all their attendance and grade records
  const handleDeleteStudent = async (studentId: string) => {
    const studentToDelete = students.find((s) => s.id === studentId);
    const updatedStudents = students.filter((s) => s.id !== studentId);
    setStudents(updatedStudents);

    // Clean up attendance map
    const updatedAttendanceMap = { ...attendanceMap };
    Object.keys(updatedAttendanceMap).forEach((cId) => {
      if (updatedAttendanceMap[cId] && updatedAttendanceMap[cId][studentId]) {
        const copy = { ...updatedAttendanceMap[cId] };
        delete copy[studentId];
        updatedAttendanceMap[cId] = copy;
      }
    });
    setAttendanceMap(updatedAttendanceMap);

    // Clean up grades
    const updatedGrades = { ...grades };
    Object.keys(updatedGrades).forEach((cId) => {
      if (updatedGrades[cId] && updatedGrades[cId][studentId]) {
        const copy = { ...updatedGrades[cId] };
        delete copy[studentId];
        updatedGrades[cId] = copy;
      }
    });
    setGrades(updatedGrades);

    showSyncNotification(`Mahasiswa ${studentToDelete?.nama || ''} telah dihapus.`, 'info');
    await pushCurrentStateToSheets({
      students: updatedStudents,
      attendanceMap: updatedAttendanceMap,
      grades: updatedGrades,
    });
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setShowAddStudentModal(true);
  };

  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setShowAddStudentModal(true);
  };

  // Add new course (Automatically creates corresponding ScheduleItem and pushes to Google Sheets)
  const handleAddCourse = async (newCourse: Course) => {
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    setSelectedCourseId(newCourse.id);

    // Otomatis buat item jadwal kuliah mingguan untuk mata kuliah baru ini
    const colorList = ['blue', 'emerald', 'purple', 'amber', 'indigo', 'rose', 'cyan'];
    const randomColor = colorList[updatedCourses.length % colorList.length];
    const newSchedule: ScheduleItem = {
      id: `sch-${Date.now()}`,
      courseId: newCourse.id,
      namaMK: newCourse.nama,
      kodeMK: newCourse.kode,
      sks: newCourse.sks,
      hari: (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(newCourse.jadwalHari) ? newCourse.jadwalHari : 'Senin') as any,
      jamMulai: newCourse.jamMulai || '08:00',
      jamSelesai: newCourse.jamSelesai || '10:30',
      ruangan: newCourse.ruangan || 'Ruang Kuliah',
      dosen: newCourse.dosenPengampu || 'Dosen Pengampu',
      kelas: newCourse.kelas || 'Kelas A',
      warna: randomColor,
    };
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);

    // Pastikan semester aktif sesuai jika mata kuliah baru didaftarkan pada semester tertentu
    if (newCourse.semester && newCourse.semester !== activeSemester && activeSemester !== 'Semua Semester') {
      setActiveSemester(newCourse.semester);
    }

    showSyncNotification(`Mata kuliah & jadwal ${newCourse.nama} berhasil ditambahkan!`, 'success');
    await pushCurrentStateToSheets({ courses: updatedCourses, schedules: updatedSchedules });
  };

  // Add schedule (Immediately pushes to Google Sheets)
  const handleAddSchedule = async (newScheduleData: Omit<ScheduleItem, 'id'>) => {
    const newSchedule: ScheduleItem = {
      ...newScheduleData,
      id: `sch-${Date.now()}`,
    };
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    showSyncNotification('Menambahkan jadwal ke Google Sheets...', 'info');
    await pushCurrentStateToSheets({ schedules: updatedSchedules });
  };

  // Delete schedule (Immediately pushes to Google Sheets)
  const handleDeleteSchedule = async (id: string) => {
    const updatedSchedules = schedules.filter((s) => s.id !== id);
    setSchedules(updatedSchedules);
    await pushCurrentStateToSheets({ schedules: updatedSchedules });
  };

  // Pull Data from Google Sheets
  const handlePullDataFromSheets = async (url?: string) => {
    const targetUrl = url || googleConfig.webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
    const result = await fetchDataFromGoogleSheets(targetUrl);
    if (result.success && result.data) {
      setStudents(result.data.students || []);
      if (result.data.courses && result.data.courses.length > 0) {
        setCourses(result.data.courses);
        setSelectedCourseId(result.data.courses[0].id);
      }
      setAttendanceMap(result.data.attendanceMap || {});
      setGrades(result.data.grades || {});
      setSchedules(result.data.schedules || []);
      if (result.data.users && result.data.users.length > 0) {
        setUserAccounts(result.data.users);
      }
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setGoogleConfig((prev) => ({
        ...prev,
        webAppUrl: targetUrl,
        status: 'success',
        lastSyncedAt: timeStr,
        errorMessage: undefined,
      }));
      showSyncNotification('Data & Akun Pengguna berhasil disinkronkan dari Google Sheets!', 'success');
      return true;
    } else {
      throw new Error(result.message);
    }
  };

  // Google Sheets Quick Sync
  const handleQuickSync = async () => {
    if (!googleConfig.webAppUrl) {
      setActiveTab('googlesheets');
      return;
    }

    await pushCurrentStateToSheets();
  };

  // Reset & Clear Data Handlers
  const handleClearAllData = () => {
    // 1. Kosongkan Mahasiswa, Absensi, Nilai, dan Jadwal
    setStudents([]);
    setAttendanceMap({});
    setGrades({});
    setSchedules([]);

    // 2. Sediakan 1 template mata kuliah kosong bersih
    const cleanCourse: Course = {
      id: `crs-${Date.now()}`,
      kode: 'HKM-101',
      nama: 'Mata Kuliah Baru',
      sks: 3,
      semester: 'Semester Ganjil 2024/2025',
      kelas: 'Kelas A',
      dosenPengampu: 'Nama Dosen Pengampu',
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
    };

    setCourses([cleanCourse]);
    setSelectedCourseId(cleanCourse.id);
    pushCurrentStateToSheets({
      students: [],
      courses: [cleanCourse],
      attendanceMap: {},
      grades: {},
      schedules: [],
    });
  };

  const handleResetAttendanceAndGradesOnly = () => {
    setAttendanceMap({});
    setGrades({});
    pushCurrentStateToSheets({ attendanceMap: {}, grades: {} });
  };

  const handleRestoreDemoData = () => {
    setStudents(demoStudents);
    setCourses(demoCourses);
    setAttendanceMap(demoAttendanceMap);
    setGrades(demoGrades);
    setSchedules(demoSchedules);
    setSelectedCourseId(demoCourses[0].id);
    pushCurrentStateToSheets({
      students: demoStudents,
      courses: demoCourses,
      attendanceMap: demoAttendanceMap,
      grades: demoGrades,
      schedules: demoSchedules,
    });
  };

  // Import JSON backup
  const handleImportBackupData = (imported: any) => {
    if (imported.students) setStudents(imported.students);
    if (imported.courses) setCourses(imported.courses);
    if (imported.attendanceMap) setAttendanceMap(imported.attendanceMap);
    if (imported.grades) setGrades(imported.grades);
    if (imported.schedules) setSchedules(imported.schedules);
  };

  // When currentUser changes or is a lecturer, automatically update selectedCourseId to the lecturer's taught course
  useEffect(() => {
    if (currentUser?.role === 'dosen') {
      const lecturerCourses = courses.filter((c) => isCourseTaughtByDosen(c, currentUser));
      if (lecturerCourses.length > 0 && !lecturerCourses.some((c) => c.id === selectedCourseId)) {
        setSelectedCourseId(lecturerCourses[0].id);
      }
    }
  }, [currentUser, courses, selectedCourseId]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    
    if (user.role === 'dosen') {
      const lecturerCourses = courses.filter((c) => isCourseTaughtByDosen(c, user));
      if (lecturerCourses.length > 0) {
        setSelectedCourseId(lecturerCourses[0].id);
        if (lecturerCourses[0].semester && activeSemester !== 'Semua Semester') {
          setActiveSemester(lecturerCourses[0].semester);
        }
      }
    }

    showSyncNotification(`Berhasil login sebagai ${user.nama} (${user.role.toUpperCase()})`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginModal(true);
    showSyncNotification('Anda telah keluar dari sistem.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-500 selection:text-white relative">
      {/* Realtime Sync Floating Indicator */}
      {syncToast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            syncToast.type === 'success' 
              ? 'bg-slate-900 text-white border-slate-700' 
              : syncToast.type === 'info'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}>
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : syncToast.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-white" />
            )}
            <span>{syncToast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'report') {
            setShowReportModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        warningCount={warningCount}
        onOpenResetData={() => setShowResetModal(true)}
        isSyncing={isSyncing}
        onQuickSync={handleQuickSync}
        googleSheetConnected={googleConfig.status === 'success'}
        onOpenSearchModal={() => setShowSearchModal(true)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {/* Main App Content Viewport */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        {currentUser?.role === 'mahasiswa' ? (
          <StudentPortalView
            currentUser={currentUser}
            students={students}
            courses={courses}
            attendanceMap={attendanceMap}
            grades={grades}
            schedules={schedules}
            activeSemester={activeSemester}
          />
        ) : (
          <>
            {/* Dosen Banner Notice if logged in as Lecturer */}
            {currentUser?.role === 'dosen' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-600/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-950 text-sm">
                      Portal Dosen: {currentUser.nama}
                    </h3>
                    <p className="text-amber-900/80 mt-0.5">
                      Menampilkan {effectiveCourses.length} mata kuliah & kelas yang Anda ampu pada {activeSemester}.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono font-semibold px-2.5 py-1 rounded-lg">
                    NIP: {currentUser.nipOrNim || '196808201994031002'}
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <DashboardTab
                course={currentCourse}
                courses={effectiveCourses}
                students={students}
                attendanceMap={attendanceMap}
                grades={grades}
                schedules={effectiveSchedules}
                activeSemester={activeSemester}
                onSelectSemester={handleSelectSemester}
                onSelectCourse={setSelectedCourseId}
                onNavigateTab={(tab) => {
                  if (tab === 'report') setShowReportModal(true);
                  else setActiveTab(tab);
                }}
                onOpenAddCourse={() => setShowAddCourseModal(true)}
                onOpenAddStudent={handleOpenAddStudent}
                onEditStudent={handleOpenEditStudent}
                pinnedCourseIds={pinnedCourseIds}
                onTogglePinCourse={handleTogglePinCourse}
                onOpenSearchModal={() => setShowSearchModal(true)}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceTab
                course={currentCourse}
                courses={effectiveCourses}
                onSelectCourse={setSelectedCourseId}
                activeSemester={activeSemester}
                onOpenAddCourse={() => setShowAddCourseModal(true)}
                students={students}
                attendanceMap={attendanceMap}
                onUpdateAttendance={handleUpdateAttendance}
                onBulkUpdateAttendance={handleBulkUpdateAttendance}
                onEditMeeting={(m) => setEditingMeeting(m)}
                onOpenAddStudent={handleOpenAddStudent}
                onEditStudent={handleOpenEditStudent}
                onBatchUpdateMeetings={handleBatchUpdateMeetings}
                pinnedCourseIds={pinnedCourseIds}
                onTogglePinCourse={handleTogglePinCourse}
                onOpenSearchModal={() => setShowSearchModal(true)}
              />
            )}

            {activeTab === 'grades' && (
              <GradesTab
                course={currentCourse}
                courses={effectiveCourses}
                onSelectCourse={setSelectedCourseId}
                activeSemester={activeSemester}
                onOpenAddCourse={() => setShowAddCourseModal(true)}
                onOpenAddStudent={handleOpenAddStudent}
                onEditStudent={handleOpenEditStudent}
                students={students}
                attendanceMap={attendanceMap}
                grades={grades}
                onUpdateGrade={handleUpdateGrade}
                onUpdateWeights={handleUpdateWeights}
                onOpenReportModal={() => setShowReportModal(true)}
                pinnedCourseIds={pinnedCourseIds}
                onTogglePinCourse={handleTogglePinCourse}
                onOpenSearchModal={() => setShowSearchModal(true)}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab
                schedules={effectiveSchedules}
                courses={effectiveCourses}
                activeSemester={activeSemester}
                onAddSchedule={handleAddSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onSelectCourse={setSelectedCourseId}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenAddCourse={() => setShowAddCourseModal(true)}
              />
            )}

            {activeTab === 'warning' && (
              <WarningSystemTab
                course={currentCourse}
                courses={effectiveCourses}
                onSelectCourse={setSelectedCourseId}
                activeSemester={activeSemester}
                onOpenAddCourse={() => setShowAddCourseModal(true)}
                onEditStudent={handleOpenEditStudent}
                students={students}
                attendanceMap={attendanceMap}
                onUpdateMinAttendance={handleUpdateMinAttendance}
                onOpenReportModal={() => setShowReportModal(true)}
              />
            )}

            {activeTab === 'googlesheets' && currentUser?.role === 'admin' && (
              <GoogleSheetIntegrationTab
                config={googleConfig}
                onUpdateConfig={(updated) => setGoogleConfig((prev) => ({ ...prev, ...updated }))}
                students={students}
                courses={courses}
                attendanceMap={attendanceMap}
                grades={grades}
                schedules={schedules}
                userAccounts={userAccounts}
                onImportData={handleImportBackupData}
                onPullDataFromSheets={handlePullDataFromSheets}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      {/* Multi-Login Modal with full Google Sheets & Database Auth */}
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLogin}
        onClose={() => setShowLoginModal(false)}
        courses={courses}
        students={students}
        userAccounts={userAccounts}
        googleConfig={googleConfig}
        onSyncFromGoogleSheets={handlePullDataFromSheets}
      />

      {/* 400+ Course Quick Command Palette Modal */}
      <CourseSearchCommandModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        courses={effectiveCourses}
        activeCourse={currentCourse}
        students={students}
        attendanceMap={attendanceMap}
        pinnedCourseIds={pinnedCourseIds}
        onTogglePin={handleTogglePinCourse}
        onSelectCourse={(courseId) => {
          setSelectedCourseId(courseId);
          const found = courses.find((c) => c.id === courseId);
          if (found && found.semester && activeSemester !== 'Semua Semester' && found.semester !== activeSemester) {
            setActiveSemester(found.semester);
          }
        }}
        onOpenAddCourse={() => setShowAddCourseModal(true)}
      />
      {showReportModal && currentCourse && (
        <ReportExportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          course={currentCourse}
          students={students}
          attendanceMap={attendanceMap}
          grades={grades}
          activeSemester={activeSemester}
        />
      )}

      <StudentModal
        isOpen={showAddStudentModal}
        onClose={() => {
          setShowAddStudentModal(false);
          setStudentToEdit(null);
        }}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
        studentToEdit={studentToEdit}
        courses={courses}
        activeCourseId={currentCourse?.id}
        activeSemester={activeSemester}
      />

      <CourseModal
        isOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        onAddCourse={handleAddCourse}
      />

      {editingMeeting && currentCourse && (
        <MeetingEditModal
          isOpen={!!editingMeeting}
          meeting={editingMeeting}
          allMeetings={currentCourse.meetings || []}
          onClose={() => setEditingMeeting(null)}
          onSave={handleSaveMeeting}
        />
      )}

      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onClearAllData={handleClearAllData}
        onResetAttendanceAndGradesOnly={handleResetAttendanceAndGradesOnly}
        onRestoreDemoData={handleRestoreDemoData}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">SIAKAD Rekap Perkuliahan & Absensi Mahasiswa</span>
            <span>•</span>
            <span>Google Apps Script REST API Bridge</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sistem Informasi Evaluasi Kehadiran 14 Pertemuan & Input Nilai Multi-Komponen
          </p>
        </div>
      </footer>
    </div>
  );
}
