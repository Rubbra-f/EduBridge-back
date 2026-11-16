import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchQuestionBank, groupQuestionsByConcept } from '../../services/assessmentApi';
import { readQuizResults } from '../../utils/storage';

export default function Progres() {
  const [bank, setBank] = useState([]);
  const [results] = useState(readQuizResults);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestionBank().then(setBank).catch((err) => setError(err.message));
  }, []);

  const materials = useMemo(() => groupQuestionsByConcept(bank), [bank]);
  const rows = materials.map((material) => {
    const id = material.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const latest = results.attempts?.[id]?.latest;
    const score = latest?.score;
    return { ...material, id, latest, score, mastered: score != null && score >= 80 };
  });
  const completed = rows.filter((item) => item.latest).length;
  const mastered = rows.filter((item) => item.mastered);
  const needsPractice = rows.filter((item) => item.latest && !item.mastered);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px] space-y-6 font-poppins text-[#2A42A1]">
        <header className="rounded-[26px] bg-gradient-to-r from-[#D6E8FF] to-[#C9E9FF] p-7">
          <h1 className="text-3xl font-extrabold">Progres Belajar</h1>
          <p className="mt-2 text-sm">Ringkasan hasil akhir assessment setiap materi.</p>
        </header>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        <section className="grid gap-4 sm:grid-cols-3">
          {[{ label: 'Materi selesai', value: completed }, { label: 'Sudah dikuasai', value: mastered.length }, { label: 'Perlu dipelajari', value: needsPractice.length }].map((item) => <article key={item.label} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-extrabold">{item.value}</p></article>)}
        </section>
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-extrabold">Hasil per materi</h2>
          <div className="mt-4 space-y-3">
            {rows.map((item) => (
              <article key={item.id} className="rounded-xl bg-[#F4F8FC] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><h3 className="font-bold">{item.name}</h3><p className="text-xs text-slate-500">{item.questions.length} soal</p></div>
                  <span className="text-sm font-extrabold">{item.score == null ? 'Belum dikerjakan' : `Nilai ${item.score}%`}</span>
                </div>
                {item.score != null && <p className={`mt-2 text-xs font-semibold ${item.mastered ? 'text-emerald-700' : 'text-amber-700'}`}>{item.mastered ? 'Sudah dikuasai' : 'Belum dikuasai — perlu latihan lagi'}</p>}
                <div className="mt-3 flex gap-3"><Link to={`/kuis?concept=${encodeURIComponent(item.name)}&mode=posttest`} className="text-xs font-bold text-[#3A81DA]">Post-test</Link><Link to={`/kuis?concept=${encodeURIComponent(item.name)}&mode=remedial`} className="text-xs font-bold text-[#3A81DA]">Remedial</Link></div>
              </article>
            ))}
            {!rows.length && !error && <p className="py-8 text-center text-sm text-slate-500">Belum ada data katalog atau hasil assessment.</p>}
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border bg-white p-5"><h2 className="font-extrabold text-emerald-700">Materi dikuasai</h2><ul className="mt-3 list-inside list-disc text-sm">{mastered.map((item) => <li key={item.id}>{item.name}</li>)}{!mastered.length && <li className="list-none text-slate-500">Belum ada materi yang mencapai nilai 80%.</li>}</ul></article>
          <article className="rounded-2xl border bg-white p-5"><h2 className="font-extrabold text-amber-700">Materi perlu penguatan</h2><ul className="mt-3 list-inside list-disc text-sm">{needsPractice.map((item) => <li key={item.id}>{item.name}</li>)}{!needsPractice.length && <li className="list-none text-slate-500">Belum ada materi yang perlu penguatan.</li>}</ul></article>
        </section>
      </div>
    </DashboardLayout>
  );
}
