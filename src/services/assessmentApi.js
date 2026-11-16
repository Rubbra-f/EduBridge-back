const API_ROOT = '/api/edubridge';

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request gagal (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.detail?.message || payload.detail || payload.message || message;
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return response.json();
}

export async function fetchQuestionBank({ signal } = {}) {
  const payload = await request('/assessment/bank', { signal });
  return Array.isArray(payload.items) ? payload.items : [];
}

export function questionImageUrl(questionId) {
  return `${API_ROOT}/assessment/images/${encodeURIComponent(questionId)}`;
}

export function getStudentId() {
  const key = 'edubridge-diagnostic-student-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.()
      ?? `student-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function submitAssessment(responses) {
  return request('/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({
      student_id: getStudentId(),
      responses: responses.map(({ questionId, answerValue }) => ({
        QuestionId: Number(questionId),
        AnswerValue: answerValue == null ? null : Number(answerValue),
      })),
    }),
  });
}

export function groupQuestionsByConcept(items) {
  const groups = new Map();
  items.forEach((item) => {
    const name = item.concept_names || 'Konsep lainnya';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  });
  return [...groups.entries()]
    .map(([name, questions]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name,
      questions: questions.sort((a, b) => Number(a.QuestionId) - Number(b.QuestionId)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
