import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getLoginKey } from '../utils/inventory';

function makeLoginKey(grade, classNumber, studentNumber) {
  return getLoginKey({ grade, classNumber, studentNumber });
}

function buildStudentDoc({ grade, classNumber, studentNumber, defaultPassword, classroomId, now }) {
  const loginKey = makeLoginKey(grade, classNumber, studentNumber);

  return {
    id: loginKey,
    loginKey,
    grade,
    classNumber,
    studentNumber,
    name: `학생${studentNumber}`,
    nickname: `학생${studentNumber}`,
    password4digit: String(defaultPassword),
    selectedCharacter: '',
    inventory: [],
    points: 0,
    classroomId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export async function seedStudents({
  repository,
  existingStudents = [],
  grade = 5,
  classNumber = 5,
  startNumber = 1,
  endNumber = 25,
  defaultPassword = '1234',
  classroomId = 'main',
}) {
  const now = new Date().toISOString();
  const existingStudentIds = new Set(
    (existingStudents || []).map((student) => student?.loginKey || student?.id).filter(Boolean),
  );
  let createdCount = 0;
  let skippedCount = 0;

  if (Number(startNumber) > Number(endNumber)) {
    throw new Error('시작 번호는 끝 번호보다 클 수 없어요.');
  }

  if (repository?.mode === 'firebase' && db) {
    const batch = writeBatch(db);

    for (let studentNumber = startNumber; studentNumber <= endNumber; studentNumber += 1) {
      const studentDoc = buildStudentDoc({
        grade,
        classNumber,
        studentNumber,
        defaultPassword,
        classroomId,
        now,
      });

      if (existingStudentIds.has(studentDoc.id)) {
        skippedCount += 1;
        continue;
      }

      batch.set(doc(db, 'students', studentDoc.id), studentDoc);
      createdCount += 1;
    }

    if (createdCount > 0) {
      await batch.commit();
    }

    return { createdCount, skippedCount };
  }

  if (!repository?.createStudent) {
    throw new Error('학생 자동 생성에 필요한 저장소를 찾지 못했습니다.');
  }

  for (let studentNumber = startNumber; studentNumber <= endNumber; studentNumber += 1) {
    const studentDoc = buildStudentDoc({
      grade,
      classNumber,
      studentNumber,
      defaultPassword,
      classroomId,
      now,
    });

    if (existingStudentIds.has(studentDoc.id)) {
      skippedCount += 1;
      continue;
    }

    await repository.createStudent(studentDoc);
    createdCount += 1;
  }

  return { createdCount, skippedCount };
}
