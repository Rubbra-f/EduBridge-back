import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { quizTopics } from './quizData';
import { readQuizResults, saveQuizResults } from '../../utils/storage';

const DURATION = 15 * 60;
const createQuiz = (topic) => ({ topicId: topic.id, questions: topic.questions, index: 0, answers: [], started: false, completed: false, startedAt: null });
const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function Kuis() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const topicId = quizTopics.some((item) => item.id === params.get('subject')) ? params.get('subject') : 'aljabar';
  const topic = quizTopics.find((item) => item.id === topicId) ?? quizTopics[0];
  const [saved, setSaved] = useState(readQuizResults);
  const [quiz, setQuiz] = useState(() => createQuiz(topic));
  const [remaining, setRemaining] = useState(DURATION);
  const [error, setError] = useState('');
  const attempt = saved.attempts?.[topic.id]?.assessment;
  const current = quiz.questions[quiz.index];
  const selected = quiz.answers[quiz.index];
  const correct = quiz.answers.filter((answer, index) => answer === quiz.questions[index]?.answer).length;
  const percent = Math.round((correct / quiz.questions.length) * 100);

  useEffect(() => {
    if (!quiz.started || quiz.completed) return undefined;
    const id = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [quiz.started, quiz.completed]);

  const finish = () => {
    if (quiz.completed) return;
    const result = {
      score: percent,
      attemptedAt: Date.now(),
      durationSeconds: Math.min(DURATION, Math.floor((Date.now() - (quiz.startedAt ?? Date.now())) / 1000)),
      completed: true,
    };
    const next = { ...saved, attempts: { ...saved.attempts, [topic.id]: { assessment: result } }, lastTopic: topic.id };
    setSaved(next);
    saveQuizResults(next);
    setQuiz((value) => ({ ...value, completed: true }));
  };

  useEffect(() => {
    if (remaining === 0 && quiz.started && !quiz.completed) finish();
  }, [remaining, quiz.started, quiz.completed]);

  const begin = () => {
    if (attempt) return;
    setError('');
    setRemaining(DURATION);
    setQuiz((value) => ({ ...value, started: true, startedAt: Date.now() }));
  };
  const choose = (index) => {
    if (!quiz.started || quiz.completed || selected !== undefined) return;
    setQuiz((value) => {
      const answers = [...value.answers];
      answers[value.index] = index;
      return { ...value, answers };
    });
  };
  const nextQuestion = () => {
    if (selected === undefined) return;
    if (quiz.index === quiz.questions.length - 1) finish();
    else setQuiz((value) => ({ ...value, index: value.index + 1 }));
  };

  const progress = useMemo(() => Math.round(((quiz.index + (selected !== undefined ? 1 : 0)) / quiz.questions.length) * 100), [quiz.index, selected, quiz.questions.length]);

  return <DashboardLayout>
    <div className="mx-auto max-w-4xl space-y-5 font-poppins text-[#2A42A1]">
      <header className="rounded-[26px] bg-gradient-to-r from-[#D8E9FF] to-[#C7E9FF] p-7">
        <button type="button" onClick={() => navigate('/katalog')} className="mb-3 text-sm font-bold">← Kembali ke katalog</button>
        <p className="text-sm font-bold">Tes diagnostik materi</p>
        <h1 className="mt-1 text-3xl font-extrabold">{topic.name}</h1>
        <p className="mt-2 text-sm">Satu materi, satu kesempatan tes. Pilih jawaban dengan teliti.</p>
      </header>
      {attempt && !quiz.completed ? <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="text-3xl">✓</div><h2 className="mt-3 text-xl font-extrabold">Tes materi ini sudah selesai</h2>
        <p className="mt-2 text-sm text-slate-600">Kamu hanya dapat mengerjakan satu tes untuk setiap materi. Hasil diagnostik terperinci hanya dapat dilihat oleh guru.</p>
        <button type="button" onClick={() => navigate('/katalog')} className="mt-5 rounded-xl bg-[#4D73EC] px-5 py-3 font-bold text-white">Kembali ke materi</button>
      </section> : quiz.completed ? <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="text-4xl">🎉</div><h2 className="mt-3 text-2xl font-extrabold">Tes selesai!</h2>
        <p className="mt-2 text-sm text-slate-600">Jawabanmu sudah dicatat. Guru dapat melihat analisis kemampuan dan laporan pembelajaranmu.</p>
        <p className="mt-2 text-xs text-slate-500">Rincian nilai dan analisis tidak ditampilkan pada akun siswa.</p>
        <button type="button" onClick={() => navigate('/katalog')} className="mt-5 rounded-xl bg-[#4D73EC] px-5 py-3 font-bold text-white">Kembali ke katalog</button>
      </section> : !quiz.started ? <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-extrabold">Siap mengerjakan tes {topic.name}?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">Tes berisi {quiz.questions.length} soal. Waktu pengerjaan 15 menit. Setelah dikirim, tes tidak dapat diulang.</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="button" onClick={begin} className="mt-6 rounded-full bg-[#4D73EC] px-8 py-3 font-bold text-white">Mulai Tes</button>
      </section> : <section className="rounded-2xl bg-[#EAF4FF] p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3 text-sm font-bold"><span>Soal {quiz.index + 1} dari {quiz.questions.length}</span><span>{clock(remaining)}</span></div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#4D80E8]" style={{ width: `${progress}%` }} /></div>
        <h2 className="rounded-xl bg-white p-5 text-lg font-bold">{current.question}</h2>
        <div className="mt-4 space-y-3">{current.options.map((option, index) => <button key={option} type="button" disabled={selected !== undefined} onClick={() => choose(index)} className={`flex w-full items-center gap-3 rounded-xl border bg-white p-4 text-left font-semibold ${selected === index ? 'border-[#4D73EC] bg-blue-50' : 'border-slate-200'}`}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7E3F8]">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
        {selected !== undefined && <button type="button" onClick={nextQuestion} className="mt-6 rounded-xl bg-[#4D73EC] px-6 py-3 font-bold text-white">{quiz.index === quiz.questions.length - 1 ? 'Kirim Tes' : 'Soal Berikutnya'}</button>}
      </section>}
      <p className="text-center text-xs text-slate-500">Catatan: versi ini menyimpan status tes di browser. Penguncian lintas perangkat dan penyimpanan hasil P-DINA di server belum aktif.</p>
    </div>
  </DashboardLayout>;
}
