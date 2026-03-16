import { createContext, useEffect, useState } from 'react';
import { CHARACTERS, DEFAULT_CLASSROOM, normalizeCharacterId } from '../utils/constants';
import { decodeUnicodeDeep, getErrorMessage } from '../utils/format';
import { createRepository } from '../services/repository';

export const AppContext = createContext(null);

const SESSION_KEY = 'gukto-guardians-session';

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? decodeUnicodeDeep(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
}

function writeSession(value) {
  if (!value) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(value));
}

function getStudentSessionId(student) {
  return student?.loginKey || student?.id || '';
}

function normalizeStudentRecord(student) {
  if (!student) {
    return student;
  }

  return {
    ...student,
    id: getStudentSessionId(student),
    selectedCharacter: normalizeCharacterId(student.selectedCharacter),
  };
}

export function AppProvider({ children }) {
  const [repository] = useState(() => createRepository());
  const [data, setData] = useState({
    classroom: DEFAULT_CLASSROOM,
    characters: CHARACTERS,
    students: [],
    items: [],
    sessions: [],
    logs: [],
    admins: [],
  });
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  async function refreshData(showSpinner = false) {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const snapshot = await repository.bootstrap();
      setData({
        classroom: snapshot.classroom || DEFAULT_CLASSROOM,
        characters: snapshot.characters || CHARACTERS,
        students: (snapshot.students || []).map(normalizeStudentRecord),
        items: snapshot.items || [],
        sessions: snapshot.sessions || [],
        logs: snapshot.logs || [],
        admins: snapshot.admins || [],
      });
      setError('');
      setInitialized(true);
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, '데이터를 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData(true);
  }, []);

  useEffect(() => {
    if (!repository.subscribeClassroom) {
      return undefined;
    }

    const unsubscribe = repository.subscribeClassroom((classroom) => {
      setData((currentData) => ({
        ...currentData,
        classroom: classroom || DEFAULT_CLASSROOM,
      }));
    });

    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, [repository]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setSyncStatus((current) => (current === 'queued' ? 'saved' : current));
    }

    function handleOffline() {
      setIsOnline(false);
      setSyncStatus((current) => (current === 'saving' ? 'queued' : current));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const savedSession = readSession();

    if (!savedSession) {
      return;
    }

    if (savedSession.role === 'student' && savedSession.userId) {
      setCurrentStudentId(savedSession.userId);
      setCurrentAdminId('');
    }

    if (savedSession.role === 'admin' && savedSession.userId) {
      setCurrentAdminId(savedSession.userId);
      setCurrentStudentId('');
    }
  }, [initialized]);

  const currentStudent = data.students.find((student) => student.id === currentStudentId) || null;
  const currentAdmin = data.admins.find((admin) => admin.id === currentAdminId) || null;
  const activeSession =
    data.sessions.find((session) => session.id === data.classroom?.activeSessionId) ||
    data.sessions.find((session) => session.shopOpen) ||
    data.sessions[0] ||
    null;

  useEffect(() => {
    if (currentStudentId && !currentStudent) {
      setCurrentStudentId('');
      writeSession(null);
    }

    if (currentAdminId && !currentAdmin) {
      setCurrentAdminId('');
      writeSession(null);
    }
  }, [currentStudentId, currentAdminId, currentStudent, currentAdmin]);

  async function runMutation(task, successStatus = 'saved') {
    setSyncStatus(isOnline ? 'saving' : 'queued');
    setError('');

    try {
      const result = await task();
      await refreshData(false);
      setSyncStatus(isOnline ? successStatus : 'queued');
      return result;
    } catch (mutationError) {
      setSyncStatus('error');
      setError(getErrorMessage(mutationError));
      throw mutationError;
    }
  }

  const actions = {
    async loginStudent(credentials) {
      setLoading(true);
      setError('');

      try {
        const student = await repository.studentLogin(credentials);
        const normalizedStudent = normalizeStudentRecord(student);
        setCurrentStudentId(getStudentSessionId(normalizedStudent));
        setCurrentAdminId('');
        writeSession({ role: 'student', userId: getStudentSessionId(normalizedStudent) });
        setData((currentData) => ({
          ...currentData,
          students: currentData.students.some((item) => item.id === normalizedStudent.id)
            ? currentData.students.map((item) => (item.id === normalizedStudent.id ? normalizedStudent : item))
            : [normalizedStudent, ...currentData.students],
        }));
        return normalizedStudent;
      } catch (loginError) {
        setError(getErrorMessage(loginError));
        throw loginError;
      } finally {
        setLoading(false);
      }
    },

    async loginAdmin(credentials) {
      setLoading(true);
      setError('');

      try {
        const admin = await repository.adminLogin(credentials);
        setCurrentAdminId(admin.id);
        setCurrentStudentId('');
        writeSession({ role: 'admin', userId: admin.id });
        setData((currentData) => ({
          ...currentData,
          admins: currentData.admins.some((item) => item.id === admin.id)
            ? currentData.admins.map((item) => (item.id === admin.id ? admin : item))
            : [admin, ...currentData.admins],
        }));
        return admin;
      } catch (loginError) {
        setError(getErrorMessage(loginError));
        throw loginError;
      } finally {
        setLoading(false);
      }
    },

    logoutStudent() {
      setCurrentStudentId('');
      writeSession(null);
    },

    logoutAdmin() {
      setCurrentAdminId('');
      writeSession(null);
    },

    async selectCharacter(characterId) {
      const updatedStudent = normalizeStudentRecord(
        await runMutation(() => repository.saveCharacter(currentStudentId, characterId)),
      );
      setCurrentStudentId(getStudentSessionId(updatedStudent));
      writeSession({ role: 'student', userId: getStudentSessionId(updatedStudent) });
      setData((currentData) => ({
        ...currentData,
        students: currentData.students.map((student) =>
          student.id === getStudentSessionId(updatedStudent) ? updatedStudent : student,
        ),
      }));
      return updatedStudent;
    },

    async submitRewardPlan(payload) {
      return runMutation(() =>
        repository.submitRewardPlan({
          studentId: currentStudentId,
          ...payload,
        }),
      );
    },

    async selectPet(payload) {
      return runMutation(() =>
        repository.selectPet({
          studentId: currentStudentId,
          ...payload,
        }),
      );
    },

    async selectSpecialItem(payload) {
      return runMutation(() =>
        repository.selectSpecialItem({
          studentId: currentStudentId,
          ...payload,
        }),
      );
    },

    async selectMissionItems(payload) {
      return runMutation(() =>
        repository.selectMissionItems({
          studentId: currentStudentId,
          ...payload,
        }),
      );
    },

    async createStudent(values) {
      return runMutation(() => repository.createStudent(values));
    },

    async updateStudent(studentId, values) {
      const updatedStudent = normalizeStudentRecord(await runMutation(() => repository.updateStudent(studentId, values)));

      if (currentStudentId === studentId) {
        setCurrentStudentId(getStudentSessionId(updatedStudent));
        writeSession({ role: 'student', userId: getStudentSessionId(updatedStudent) });
      }

      return updatedStudent;
    },

    async deleteStudent(studentId) {
      return runMutation(() => repository.deleteStudent(studentId));
    },

    async createItem(values) {
      return runMutation(() => repository.createItem(values));
    },

    async updateItem(itemId, values) {
      return runMutation(() => repository.updateItem(itemId, values));
    },

    async deleteItem(itemId) {
      return runMutation(() => repository.deleteItem(itemId));
    },

    async createSession(values) {
      return runMutation(() => repository.createSession(values));
    },

    async updateSession(sessionId, values) {
      return runMutation(() => repository.updateSession(sessionId, values));
    },

    async deleteSession(sessionId) {
      return runMutation(() => repository.deleteSession(sessionId));
    },

    async updateCurrentSession(sessionId) {
      return runMutation(() => repository.updateCurrentSession(sessionId));
    },

    async giveBonusItemToStudent(payload) {
      return runMutation(() => repository.giveBonusItemToStudent(payload));
    },

    async giveBonusItemToAll(payload) {
      return runMutation(() => repository.giveBonusItemToAll(payload));
    },

    async removeInventoryEntry(payload) {
      return runMutation(() => repository.removeInventoryEntry(payload));
    },

    async resetMockData() {
      if (repository.mode !== 'mock' || !repository.resetMockData) {
        return false;
      }

      const result = await runMutation(() => repository.resetMockData());
      setCurrentStudentId('');
      setCurrentAdminId('');
      writeSession(null);
      return result;
    },

    async refresh() {
      await refreshData(true);
    },
  };

  const value = {
    repository,
    repositoryMode: repository.mode,
    classroom: data.classroom,
    characters: data.characters,
    students: data.students,
    items: data.items,
    sessions: data.sessions,
    logs: data.logs,
    admins: data.admins,
    currentStudent,
    currentAdmin,
    activeSession,
    loading,
    initialized,
    error,
    syncStatus,
    isOnline,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
