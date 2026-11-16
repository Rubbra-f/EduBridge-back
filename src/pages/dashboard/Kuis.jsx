import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchQuestionBank, groupQuestionsByConcept, questionImageUrl, submitAssessment } from '../../services/assessmentApi';
import { readQuizResults, saveQuizResults } from '../../utils/storage';

const MODES = [
  { id: 'pretest', label: 'Pre-Test' },
  { id: 'posttest', label: 'Post-Test' },
  { id: 'remedial', label: 'Remedial' },
];

function getMode(value) {
  return MODES.some((mode) => mode.id === value) ? value : 'pretest';
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Kuis() {
  const [params, setParams] = useSearchParams();
  const conceptName = params.get('concept') || '';
  const mode = getMode(params.get('mode'));
  const [bank, setBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  const [results, setResults] = useState(readQuizResults);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestionBank({ signal: controller.signal })
      .then(setBank)
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const materials = useMemo(() => groupQuestionsByConcept(bank), [bank]);
  const material = materials.find((item) => item.name === conceptName);
  const materialId = material ? slug(material.name) : '';
  const previous = results.attempts?.[materialId]?.[mode];
  const previousWrongIds = results.attempts?.[materialId]?.latestIncorrectIds ?? [];
  const questions = useMemo(() => {
    if (!material) return [];
    if (mode === 'remedial' && previousWrongIds.length) {
      return material.questions.filter((item) => previousWrongIds.includes(Number(item.QuestionId)));
    }
    return material.questions;
  }, [material, mode, previousWrongIds]);
  const currentQuestion = questions[questionIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && questions.every((item) => answers[item.QuestionId] !== undefined);

  const changeMode = (nextMode) => {
    setParams({ concept: conceptName, mode: nextMode });
    setAnswers({});
    setQuestionIndex(0);
    setStarted(false);
    setResult(null);
    setSubmitError('');
  };

  const chooseAnswer = (value) => {
    if (!started || submitting || result) return;
    setAnswers((current) => ({ ...current, [currentQuestion.QuestionId]: value }));
  };

  const finishAssessment = useCallback(async () => {
    if (!material || !allAnswered || submitting || result) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const responses = questions.map((item) => ({
        questionId: item.QuestionId,
        answerValue: answers[item.QuestionId],
      }));
      const response = await submitAssessment(responses);
      const score = Number.isFinite(response.score)
        ? response.score
        : Number.isFinite(response.correct_count) && questions.length
          ? Math.round((response.correct_count / questions.length) * 100)
          : null;
      const attempt = {
        score,
        submitted: response.submitted ?? questions.length,
        correctCount: response.correct_count ?? null,
        incorrectCount: response.incorrect_count ?? null,
        incorrectIds: response.incorrect_question_ids ?? [],
        attemptedAt: Date.now(),
        diagnosis: response.diagnosis ?? null,
      };
      const nextResults = {
        ...results,
        attempts: {
          ...results.attempts,
          [materialId]: {
            ...results.attempts?.[materialId],
            [mode]: attempt,
            latestIncorrectIds: attempt.incorrectIds,
            latest: attempt,
          },
        },
        lastTopic: materialId,
        lastMode: mode,
      };
      saveQuizResults(nextResults);
      setResults(nextResults);
      setResult(response);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  }, [allAnswered, answers, material, materialId, mode, questions, result, results, submitting]);

  if (loading) {
    return <DashboardLayout><div className="rounded-2xl bg-white p-8 text-center text-[#2A42A1]">Memuat soal dari backend…</div></DashboardLayout>;
  }

  if (loadError) {
    return <DashboardLayout><div role="alert" className="rounded-2xl bg-rose-50 p-6 text-rose-800"><b>Soal gagal dimuat.</b><p className="mt-2">{loadError}</p><Link className="mt-4 inline-block underline" to="/katalog">Kembali ke katalog</Link></div></DashboardLayout>;
  }

  if (!material) {
    return <DashboardLayout><div className="rounded-2xl bg-white p-8 text-[#2A42A1]"><h1 className="text-xl font-bold">Pilih materi terlebih dahulu</h1><p className="mt-2 text-sm">Assessment harus dibuka dari katalog materi backend.</p><Link className="mt-4 inline-block font-bold text-[#3A81DA]" to="/katalog">Buka katalog →</Link></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-5 font-poppins text-[#2A42A1]">
        <header className="rounded-[26px] bg-gradient-to-r from-[#D8E9FF] to-[#C7E9FF] p-6 sm:p-8">
          <Link to="/katalog" className="text-xs font-bold text-[#3A81DA]">← Kembali ke katalog</Link>
          <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{material.name}</h1>
          <p className="mt-2 text-sm">Assessment gambar · {questions.length} soal · Pilih A, B, C, atau D.</p>
        </header>

        <div className="flex flex-wrap gap-2">
          {MODES.map((item) => (
            <button key={item.id} type="button" onClick={() => changeMode(item.id)} className={`rounded-full px-4 py-2 text-sm font-bold ${mode === item.id ? 'bg-[#3A81DA] text-white' : 'bg-white text-[#3A81DA]'}`}>{item.label}</button>
          ))}
        </div>

        {previous && <p className="rounded-xl bg-white p-3 text-xs text-slate-500">Hasil {mode}: {previous.score == null ? 'diagnosis tersimpan' : `${previous.score}%`}.</p>}

        {!questions.length && <div className="rounded-2xl bg-amber-50 p-5 text-amber-800">Tidak ada soal untuk mode remedial. Selesaikan assessment terlebih dahulu atau pilih mode lain.</div>}

        {questions.length > 0 && !result && (
          <section className="rounded-[24px] border border-[#D6E2F0] bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-extrabold">Soal {questionIndex + 1} dari {questions.length}</span>
              <span className="text-xs font-semibold text-slate-500">{answeredCount}/{questions.length} terjawab</span>
            </div>
            <div className="mb-5 overflow-hidden rounded-xl bg-[#F5F8FC]">
              <img src={questionImageUrl(currentQuestion.QuestionId)} alt={`Soal ${questionIndex + 1} untuk ${material.name}`} className="mx-auto max-h-[560px] w-full object-contain" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextSibling.style.display = 'block'; }} />
              <p className="hidden p-8 text-center text-sm text-rose-700">Gambar soal tidak ditemukan di server. Periksa EEDI_IMAGE_DIR dan file {currentQuestion.QuestionId}.jpg.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['A', 'B', 'C', 'D'].map((label, index) => {
                const value = index + 1;
                const selected = answers[currentQuestion.QuestionId] === value;
                return <button key={label} type="button" disabled={!started || submitting} onClick={() => chooseAnswer(value)} className={`rounded-xl border px-4 py-4 text-lg font-extrabold transition ${selected ? 'border-[#3A81DA] bg-[#DCEEFF] text-[#2454A2]' : 'border-slate-200 bg-white hover:border-[#3A81DA]'}`}>{label}</button>;
              })}
            </div>
            {!started && <button type="button" onClick={() => setStarted(true)} className="mt-5 w-full rounded-xl bg-[#3A81DA] px-5 py-3 font-bold text-white">Mulai assessment</button>}
            {started && (
              <div className="mt-5 flex flex-wrap justify-between gap-3">
                <button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => index - 1)} className="rounded-xl border px-5 py-3 text-sm font-bold disabled:opacity-40">Sebelumnya</button>
                {questionIndex < questions.length - 1
                  ? <button type="button" onClick={() => setQuestionIndex((index) => index + 1)} className="rounded-xl bg-[#3A81DA] px-5 py-3 text-sm font-bold text-white">Berikutnya →</button>
                  : <button type="button" disabled={!allAnswered || submitting} onClick={finishAssessment} className="rounded-xl bg-[#3A81DA] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{submitting ? 'Mengirim…' : 'Kirim jawaban'}</button>}
              </div>
            )}
            {submitError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{submitError}</p>}
          </section>
        )}

        {result && (
          <section className="space-y-4 rounded-[24px] border border-[#D6E2F0] bg-white p-5 sm:p-7">
            <h2 className="text-xl font-extrabold">Assessment selesai</h2>
            {result.correct_count != null && <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs">Benar</p><p className="text-3xl font-extrabold text-emerald-700">{result.correct_count}</p></div><div className="rounded-xl bg-rose-50 p-4"><p className="text-xs">Salah</p><p className="text-3xl font-extrabold text-rose-700">{result.incorrect_count}</p></div></div>}
            {result.diagnosis?.mastery_profiles_target?.length > 0 && <div><h3 className="font-bold">Hasil penguasaan konsep</h3><div className="mt-3 space-y-2">{result.diagnosis.mastery_profiles_target.map((item, index) => <pre key={index} className="overflow-x-auto rounded-lg bg-[#F4F8FC] p-3 text-xs">{JSON.stringify(item, null, 2)}</pre>)}</div></div>}
            {!result.diagnosis?.mastery_profiles_target?.length && <p className="text-sm text-slate-600">Jawaban diterima backend dan diagnosis berhasil diproses. Hasil diagnosis tersedia pada respons API.</p>}
            {result.correct_count == null && <p className="text-xs text-amber-700">API saat ini belum mengirim jumlah benar/salah. Hasil diagnosis tetap diproses di backend; tambahkan ringkasan skor pada endpoint submit untuk menampilkan angka tersebut.</p>}
            <div className="flex flex-wrap gap-3"><button type="button" onClick={() => changeMode('posttest')} className="rounded-xl bg-[#3A81DA] px-5 py-3 text-sm font-bold text-white">Lanjut Post-Test</button><button type="button" onClick={() => changeMode('remedial')} className="rounded-xl border border-[#3A81DA] px-5 py-3 text-sm font-bold text-[#3A81DA]">Remedial</button><Link to="/progres" className="rounded-xl border px-5 py-3 text-sm font-bold">Lihat progres</Link></div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
