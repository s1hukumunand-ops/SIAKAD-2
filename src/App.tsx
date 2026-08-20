import React, { useState, useEffect, useRef } from 'react';
import { 
  Course, 
  Student, 
  StudentAttendanceMap, 
  StudentGrade, 
  ScheduleItem, 
  GoogleSheetsSyncConfig, 
  MeetingInfo,
  AttendanceStatus 
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
import { CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  // State Initialization with LocalStorage Persistence
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('siakad_courses');
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const saved = localStorage.getItem('siakad_selected_course');
    return saved || (initialCourses[0]?.id || '');
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('siakad_students');
    return saved ? JSON.parse(saved) : initialStudents;
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

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingInfo | null>(null);

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
  }) => {
    const targetUrl = googleConfig.webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
    if (!targetUrl || !targetUrl.startsWith('http')) return;

    setIsSyncing(true);
    try {
      const result = await pushDataToGoogleSheets(targetUrl, {
        students: overrides?.students ?? students,
        courses: overrides?.courses ?? courses,
        attendanceMap: overrides?.attendanceMap ?? attendanceMap,
        grades: overrides?.grades ?? grades,
        schedules: overrides?.schedules ?? schedules,
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

  // Current Course
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

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

  // Handler for Meeting topic/date edit
  const handleSaveMeeting = (updatedMeeting: MeetingInfo) => {
    if (!currentCourse) return;

    const updatedCourses = courses.map((c) => {
      if (c.id !== currentCourse.id) return c;
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
    showSyncNotification('Menambahkan mahasiswa ke Google Sheets...', 'info');
    await pushCurrentStateToSheets({ students: updatedStudents });
  };

  // Add new course (Immediately pushes to Google Sheets)
  const handleAddCourse = async (newCourse: Course) => {
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    setSelectedCourseId(newCourse.id);
    await pushCurrentStateToSheets({ courses: updatedCourses });
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
  const handlePullDataFromSheets = async (url: string) => {
    const result = await fetchDataFromGoogleSheets(url);
    if (result.success && result.data) {
      setStudents(result.data.students || []);
      if (result.data.courses && result.data.courses.length > 0) {
        setCourses(result.data.courses);
        setSelectedCourseId(result.data.courses[0].id);
      }
      setAttendanceMap(result.data.attendanceMap || {});
      setGrades(result.data.grades || {});
      setSchedules(result.data.schedules || []);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setGoogleConfig((prev) => ({
        ...prev,
        webAppUrl: url,
        status: 'success',
        lastSyncedAt: timeStr,
        errorMessage: undefined,
      }));
      showSyncNotification('Data berhasil diperbarui dari Google Sheets!', 'success');
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

  if (!currentCourse) {
    return <div className="p-8 text-center">Memuat aplikasi perkuliahan...</div>;
  }

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
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourse={setSelectedCourseId}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'report') {
            setShowReportModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        warningCount={warningCount}
        onOpenAddCourse={() => setShowAddCourseModal(true)}
        onOpenAddStudent={() => setShowAddStudentModal(true)}
        onOpenResetData={() => setShowResetModal(true)}
        isSyncing={isSyncing}
        onQuickSync={handleQuickSync}
        googleSheetConnected={googleConfig.status === 'success'}
      />

      {/* Main App Content Viewport */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        {activeTab === 'dashboard' && (
          <DashboardTab
            course={currentCourse}
            students={students}
            attendanceMap={attendanceMap}
            grades={grades}
            schedules={schedules}
            onNavigateTab={(tab) => {
              if (tab === 'report') setShowReportModal(true);
              else setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab
            course={currentCourse}
            students={students}
            attendanceMap={attendanceMap}
            onUpdateAttendance={handleUpdateAttendance}
            onBulkUpdateAttendance={handleBulkUpdateAttendance}
            onEditMeeting={(m) => setEditingMeeting(m)}
            onOpenAddStudent={() => setShowAddStudentModal(true)}
          />
        )}

        {activeTab === 'grades' && (
          <GradesTab
            course={currentCourse}
            students={students}
            attendanceMap={attendanceMap}
            grades={grades}
            onUpdateGrade={handleUpdateGrade}
            onUpdateWeights={handleUpdateWeights}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            schedules={schedules}
            courses={courses}
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onSelectCourse={setSelectedCourseId}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'warning' && (
          <WarningSystemTab
            course={currentCourse}
            students={students}
            attendanceMap={attendanceMap}
            onUpdateMinAttendance={handleUpdateMinAttendance}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        )}

        {activeTab === 'googlesheets' && (
          <GoogleSheetIntegrationTab
            config={googleConfig}
            onUpdateConfig={(updated) => setGoogleConfig((prev) => ({ ...prev, ...updated }))}
            students={students}
            courses={courses}
            attendanceMap={attendanceMap}
            grades={grades}
            schedules={schedules}
            onImportData={handleImportBackupData}
            onPullDataFromSheets={handlePullDataFromSheets}
          />
        )}
      </main>

      {/* Global Modals */}
      <ReportExportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        course={currentCourse}
        students={students}
        attendanceMap={attendanceMap}
        grades={grades}
      />

      <StudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onAddStudent={handleAddStudent}
      />

      <CourseModal
        isOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        onAddCourse={handleAddCourse}
      />

      <MeetingEditModal
        isOpen={!!editingMeeting}
        meeting={editingMeeting}
        onClose={() => setEditingMeeting(null)}
        onSave={handleSaveMeeting}
      />

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
