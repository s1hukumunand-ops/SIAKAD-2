import React, { useState, useEffect } from 'react';
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

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-Fetch data from Google Sheets on application initial load
  useEffect(() => {
    const targetUrl = googleConfig.webAppUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL;
    if (targetUrl && targetUrl.startsWith('http')) {
      fetchDataFromGoogleSheets(targetUrl)
        .then((result) => {
          if (result.success && result.data) {
            // Only overwrite if Sheets returned valid data structure
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

            const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setGoogleConfig((prev) => ({
              ...prev,
              webAppUrl: targetUrl,
              status: 'success',
              lastSyncedAt: timeStr,
              errorMessage: undefined,
            }));
          } else {
            // Mark as connected ready
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

    setAttendanceMap((prev) => {
      const courseAtt = { ...(prev[currentCourse.id] || {}) };
      const studentRecs = { ...(courseAtt[studentId] || {}) };

      if (status === null) {
        delete studentRecs[meetingNum];
      } else {
        studentRecs[meetingNum] = status;
      }

      courseAtt[studentId] = studentRecs;
      return {
        ...prev,
        [currentCourse.id]: courseAtt,
      };
    });
  };

  const handleBulkUpdateAttendance = (meetingNum: number, status: AttendanceStatus) => {
    if (!currentCourse) return;

    setAttendanceMap((prev) => {
      const courseAtt = { ...(prev[currentCourse.id] || {}) };

      students.forEach((std) => {
        const studentRecs = { ...(courseAtt[std.id] || {}) };
        if (status === null) {
          delete studentRecs[meetingNum];
        } else {
          studentRecs[meetingNum] = status;
        }
        courseAtt[std.id] = studentRecs;
      });

      return {
        ...prev,
        [currentCourse.id]: courseAtt,
      };
    });
  };

  // Handler for Meeting topic/date edit
  const handleSaveMeeting = (updatedMeeting: MeetingInfo) => {
    if (!currentCourse) return;

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== currentCourse.id) return c;
        const updatedMeetings = c.meetings.map((m) =>
          m.meetingNumber === updatedMeeting.meetingNumber ? updatedMeeting : m
        );
        return {
          ...c,
          meetings: updatedMeetings,
        };
      })
    );
  };

  // Handler for Grades
  const handleUpdateGrade = (studentId: string, updatedField: Partial<StudentGrade>) => {
    if (!currentCourse) return;

    setGrades((prev) => {
      const courseGrd = { ...(prev[currentCourse.id] || {}) };
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

      return {
        ...prev,
        [currentCourse.id]: courseGrd,
      };
    });
  };

  // Handler for Grade Weights
  const handleUpdateWeights = (newWeights: Course['gradeWeights']) => {
    if (!currentCourse) return;

    setCourses((prev) =>
      prev.map((c) => (c.id === currentCourse.id ? { ...c, gradeWeights: newWeights } : c))
    );
  };

  // Handler for Min Attendance Percent
  const handleUpdateMinAttendance = (minPercent: number) => {
    if (!currentCourse) return;

    setCourses((prev) =>
      prev.map((c) => (c.id === currentCourse.id ? { ...c, minAttendancePercent: minPercent } : c))
    );
  };

  // Add new student
  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  // Add new course
  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
    setSelectedCourseId(newCourse.id);
  };

  // Add schedule
  const handleAddSchedule = (newScheduleData: Omit<ScheduleItem, 'id'>) => {
    const newSchedule: ScheduleItem = {
      ...newScheduleData,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  // Delete schedule
  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
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

    setIsSyncing(true);
    const result = await pushDataToGoogleSheets(googleConfig.webAppUrl, {
      students,
      courses,
      attendanceMap,
      grades,
      schedules,
    });
    setIsSyncing(false);

    if (result.success) {
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setGoogleConfig((prev) => ({
        ...prev,
        status: 'success',
        lastSyncedAt: timeStr,
      }));
    } else {
      setGoogleConfig((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: result.message,
      }));
    }
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
  };

  const handleResetAttendanceAndGradesOnly = () => {
    setAttendanceMap({});
    setGrades({});
  };

  const handleRestoreDemoData = () => {
    setStudents(demoStudents);
    setCourses(demoCourses);
    setAttendanceMap(demoAttendanceMap);
    setGrades(demoGrades);
    setSchedules(demoSchedules);
    setSelectedCourseId(demoCourses[0].id);
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
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
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
