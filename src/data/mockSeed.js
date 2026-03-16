import { CHARACTERS, DEFAULT_CLASSROOM } from '../utils/constants';
import { getLoginKey } from '../utils/inventory';
import { createSeedItems, createSeedSessions } from './lessonItemSeeds';

const baseTime = '2026-03-15T08:30:00.000Z';

export const MOCK_SEED = {
  classroom: {
    ...DEFAULT_CLASSROOM,
    createdAt: baseTime,
    updatedAt: baseTime,
  },
  characters: CHARACTERS,
  admins: [
    {
      id: 'teacher',
      loginId: 'teacher',
      password: '1234',
      name: '담임 선생님',
      createdAt: baseTime,
      updatedAt: baseTime,
    },
  ],
  students: [
    {
      id: getLoginKey({ grade: 5, classNumber: 1, studentNumber: 1 }),
      loginKey: getLoginKey({ grade: 5, classNumber: 1, studentNumber: 1 }),
      grade: 5,
      classNumber: 1,
      studentNumber: 1,
      name: '김하늘',
      nickname: '하늘',
      password4digit: '1111',
      selectedCharacter: 'maru',
      inventory: [],
      createdAt: baseTime,
      updatedAt: baseTime,
    },
    {
      id: getLoginKey({ grade: 5, classNumber: 1, studentNumber: 2 }),
      loginKey: getLoginKey({ grade: 5, classNumber: 1, studentNumber: 2 }),
      grade: 5,
      classNumber: 1,
      studentNumber: 2,
      name: '이바다',
      nickname: '바다',
      password4digit: '2222',
      selectedCharacter: '',
      inventory: [],
      createdAt: baseTime,
      updatedAt: baseTime,
    },
  ],
  items: createSeedItems(baseTime),
  sessions: createSeedSessions(baseTime),
  logs: [],
};

export function cloneMockSeed() {
  return JSON.parse(JSON.stringify(MOCK_SEED));
}
