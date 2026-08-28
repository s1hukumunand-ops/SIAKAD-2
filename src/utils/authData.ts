import { AuthUser, Course, Student, UserAccount } from '../types';

export const ADMIN_USER: AuthUser = {
  id: 'usr-admin',
  username: 'admin',
  password: 'admin123',
  nama: 'Administrator SIAKAD',
  role: 'admin',
  email: 's1hukum.unand@gmail.com',
  nipOrNim: '198501012010121001',
  prodi: 'Fakultas Hukum',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// Preset prominent Lecturers (empty by default to avoid bloating user database with dummy lecturers)
export const PRESET_DOSEN_USERS: AuthUser[] = [];

/**
 * Strict and robust check if a course is taught by the logged-in Dosen
 */
export function isCourseTaughtByDosen(course: Course, dosenUser: AuthUser | UserAccount | null | undefined): boolean {
  if (!dosenUser || dosenUser.role !== 'dosen' || !course) return false;

  // 1. Strict NIP match (if NIP is defined and not placeholder)
  const userNipDigits = (dosenUser.nipOrNim || '').replace(/[^0-9]/g, '');
  const courseNipDigits = (course.nipDosen || '').replace(/[^0-9]/g, '');
  if (userNipDigits.length >= 8 && courseNipDigits.length >= 8) {
    if (userNipDigits === courseNipDigits || courseNipDigits.includes(userNipDigits) || userNipDigits.includes(courseNipDigits)) {
      return true;
    }
  }

  // 2. Name Matching
  const targetName = (dosenUser.dosenName || dosenUser.nama || '').trim();
  const courseDosen = (course.dosenPengampu || '').trim();
  if (!targetName || !courseDosen || courseDosen === '-') return false;

  // Direct exact case-insensitive match
  if (courseDosen.toLowerCase() === targetName.toLowerCase()) {
    return true;
  }

  // Helper to extract significant name tokens (ignoring titles and punctuation)
  const extractSignificantTokens = (nameStr: string): string[] => {
    return nameStr
      .toLowerCase()
      .replace(/\b(prof|dr|drs|dra|h|hj|s\.h|m\.h|m\.p\.a|m\.hum|m\.kn|ph\.d|ll\.m|s\.kom|m\.kom|s\.e|m\.m|s\.sos|m\.si|m\.sc|b\.a|m\.a|s\.ip|s\.ked|sp\.a)\b/gi, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3);
  };

  const targetTokens = extractSignificantTokens(targetName);
  if (targetTokens.length === 0) return false;

  // Split course lecturer field by separators in case of team-teaching (e.g. "Prof. Saldi / Dr. Charles")
  const subLecturers = courseDosen.split(/[/;&,+]|\bdan\b/gi).map((s) => s.trim()).filter(Boolean);

  for (const subLecturer of subLecturers) {
    const subTokens = extractSignificantTokens(subLecturer);
    if (subTokens.length > 0) {
      // Check if all significant tokens of the target lecturer are in this subLecturer
      const allTokensMatch = targetTokens.every((tok) => subTokens.includes(tok));
      if (allTokensMatch) return true;

      // Check if majority of tokens match (e.g. 2 or more matching tokens)
      const matchingCount = targetTokens.filter((tok) => subTokens.includes(tok)).length;
      if (matchingCount >= 2 && matchingCount >= Math.ceil(targetTokens.length * 0.6)) {
        return true;
      }
    }
  }

  // Check against the entire courseDosen string
  const courseTokens = extractSignificantTokens(courseDosen);
  if (courseTokens.length > 0) {
    const allTokensMatch = targetTokens.every((tok) => courseTokens.includes(tok));
    if (allTokensMatch) return true;
  }

  return false;
}

// Helper to create AuthUser from a Student record
export const createStudentAuthUser = (student: Student, customPassword?: string): AuthUser => {
  return {
    id: `usr-std-${student.id}`,
    username: student.nim,
    password: customPassword || 'mhs123',
    nama: student.nama,
    role: 'mahasiswa',
    email: student.email || `${student.nim}@student.univ.ac.id`,
    nipOrNim: student.nim,
    nim: student.nim,
    studentId: student.id,
    prodi: student.prodi || 'Ilmu Hukum',
    avatarUrl: student.jenisKelamin === 'P'
      ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };
};

// Helper to create AuthUser from a Lecturer name found in courses
export const createDosenAuthUser = (dosenName: string, nip?: string, customPassword?: string): AuthUser => {
  const cleanName = dosenName.replace(/^(Prof\.|Dr\.|Drs\.|H\.|Hj\.)\s+/gi, '').trim();
  const username = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.');
  const validNip = nip && nip !== '-' ? nip : undefined;
  return {
    id: `usr-dos-${encodeURIComponent(dosenName)}`,
    username: validNip || (username || 'dosen'),
    password: customPassword || 'dosen123',
    nama: dosenName,
    role: 'dosen',
    email: `${username || 'dosen'}@law.univ.ac.id`,
    nipOrNim: validNip || '',
    prodi: 'Bagian Hukum',
    dosenName: dosenName,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  };
};

// Extract all unique lecturers from the Course list
export const getAllLecturersFromCourses = (courses: Course[]): { name: string; nip: string; courseCount: number }[] => {
  const map = new Map<string, { name: string; nip: string; courseCount: number }>();

  (courses || []).forEach((c) => {
    const rawLecturer = (c?.dosenPengampu || '').trim();
    if (rawLecturer && rawLecturer !== '-' && rawLecturer !== 'Dosen Pengampu') {
      const existing = map.get(rawLecturer);
      if (existing) {
        existing.courseCount += 1;
        if ((!existing.nip || existing.nip === '-') && c.nipDosen && c.nipDosen !== '-') {
          existing.nip = c.nipDosen;
        }
      } else {
        map.set(rawLecturer, {
          name: rawLecturer,
          nip: (c.nipDosen && c.nipDosen !== '-') ? c.nipDosen : '',
          courseCount: 1,
        });
      }
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Generate complete User Accounts database from Courses, Students, and Google Sheets custom users
 */
export const getAllUserAccounts = (
  courses: Course[],
  students: Student[],
  syncedGoogleUsers?: UserAccount[]
): UserAccount[] => {
  const accountMap = new Map<string, UserAccount>();

  // 1. Admin Account (Always Available)
  accountMap.set(ADMIN_USER.id, ADMIN_USER);

  // 2. Real Lecturers from actual Course list
  const lecturers = getAllLecturersFromCourses(courses || []);
  lecturers.forEach((l) => {
    const acc = createDosenAuthUser(l.name, l.nip);
    if (!accountMap.has(acc.id)) {
      accountMap.set(acc.id, acc);
    }
  });

  // 3. Real Students from Student roster
  (students || []).forEach((std) => {
    const acc = createStudentAuthUser(std);
    accountMap.set(acc.id, acc);
  });

  // 5. Override / Merge with Google Sheets Synced Users if available
  if (Array.isArray(syncedGoogleUsers) && syncedGoogleUsers.length > 0) {
    syncedGoogleUsers.forEach((gu) => {
      if (gu.username || gu.nipOrNim || gu.id) {
        // Find existing match or add new
        const existingKey = Array.from(accountMap.keys()).find((k) => {
          const acc = accountMap.get(k);
          return acc?.id === gu.id || (acc?.username && acc.username.toLowerCase() === gu.username?.toLowerCase());
        });

        if (existingKey) {
          const current = accountMap.get(existingKey)!;
          accountMap.set(existingKey, {
            ...current,
            ...gu,
            password: gu.password || current.password || (gu.role === 'admin' ? 'admin123' : gu.role === 'dosen' ? 'dosen123' : 'mhs123'),
          });
        } else {
          accountMap.set(gu.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, {
            id: gu.id || `usr-${Date.now()}`,
            username: gu.username || gu.nipOrNim || 'user',
            password: gu.password || (gu.role === 'admin' ? 'admin123' : gu.role === 'dosen' ? 'dosen123' : 'mhs123'),
            nama: gu.nama || 'Pengguna SIAKAD',
            role: gu.role || 'mahasiswa',
            email: gu.email || `${gu.username || 'user'}@univ.ac.id`,
            nipOrNim: gu.nipOrNim || gu.nim || '',
            prodi: gu.prodi || 'Ilmu Hukum',
            dosenName: gu.dosenName,
            studentId: gu.studentId,
            nim: gu.nim || gu.nipOrNim,
          });
        }
      }
    });
  }

  return Array.from(accountMap.values());
};

/**
 * Verify user credentials against local accounts or synced Google Sheets database
 */
export const verifyCredentials = (
  usernameOrNip: string,
  passwordInput: string,
  accounts: UserAccount[]
): { success: boolean; user?: AuthUser; message: string } => {
  const query = usernameOrNip.trim().toLowerCase();
  const pass = passwordInput.trim();

  if (!query) {
    return { success: false, message: 'Username / NIP / NIM tidak boleh kosong.' };
  }
  if (!pass) {
    return { success: false, message: 'Kata sandi tidak boleh kosong.' };
  }

  // Find candidate account
  const account = accounts.find((acc) => {
    if (acc.username && acc.username.toLowerCase() === query) return true;
    if (acc.nipOrNim && acc.nipOrNim.toLowerCase() === query) return true;
    if (acc.nim && acc.nim.toLowerCase() === query) return true;
    if (acc.email && acc.email.toLowerCase() === query) return true;
    if (acc.dosenName && acc.dosenName.toLowerCase().includes(query)) return true;
    return false;
  });

  if (!account) {
    return {
      success: false,
      message: `Akun dengan username/NIP/NIM "${usernameOrNip}" tidak ditemukan di database. Pastikan data sudah terdaftar atau sinkronkan dari Google Sheets.`,
    };
  }

  // Check password
  // Allowed passwords: exact stored password, or standard defaults based on role/identifier
  const validPasswords = new Set<string>();
  if (account.password) validPasswords.add(account.password);
  
  if (account.role === 'admin') {
    validPasswords.add('admin123');
    validPasswords.add('admin');
  } else if (account.role === 'dosen') {
    validPasswords.add('dosen123');
    validPasswords.add('dosen');
    if (account.nipOrNim) validPasswords.add(account.nipOrNim);
  } else if (account.role === 'mahasiswa') {
    validPasswords.add('mhs123');
    validPasswords.add('mahasiswa');
    if (account.nim) validPasswords.add(account.nim);
    if (account.nipOrNim) validPasswords.add(account.nipOrNim);
  }

  if (validPasswords.has(pass)) {
    return {
      success: true,
      user: account,
      message: 'Login berhasil!',
    };
  }

  return {
    success: false,
    message: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali.',
  };
};

