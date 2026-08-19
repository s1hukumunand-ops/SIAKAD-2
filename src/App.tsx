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
  initialSchedules 
} from './data/initialData';
import { calculateAttendanceSummary } from './utils/calculations';
import { pushDataToGoogleSheets } from './services/googleSheetService';

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
    return saved
      ? JSON.parse(saved)
      : {
          webAppUrl: '',
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
  const [editingMeeting, setEditingMeeting] = useState<MeetingInfo | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

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
