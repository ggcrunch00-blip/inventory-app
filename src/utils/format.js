import { ACTION_TYPE_LABELS } from './constants';

export function decodeUnicodeText(value) {
  if (typeof value !== 'string') {
    return value ?? '';
  }

  if (!value.includes('\\')) {
    return value;
  }

  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

export function decodeUnicodeDeep(value) {
  if (Array.isArray(value)) {
    return value.map((item) => decodeUnicodeDeep(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, itemValue]) => [key, decodeUnicodeDeep(itemValue)]),
    );
  }

  return decodeUnicodeText(value);
}

export function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatStudentLabel(student) {
  if (!student) {
    return '';
  }

  return `${student.grade}\uD559\uB144 ${student.classNumber}\uBC18 ${student.studentNumber}\uBC88 ${decodeUnicodeText(student.name)}`;
}

export function actionTypeToLabel(actionType) {
  return decodeUnicodeText(ACTION_TYPE_LABELS[actionType] || actionType);
}

export function getErrorMessage(error, fallback = '\uC694\uCCAD\uC744 \uCC98\uB9AC\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694.') {
  if (typeof error === 'string') {
    return decodeUnicodeText(error);
  }

  if (error instanceof Error) {
    return decodeUnicodeText(error.message || fallback);
  }

  return decodeUnicodeText(fallback);
}
