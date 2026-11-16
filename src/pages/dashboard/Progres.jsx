import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { quizTopics } from './quizData';
import { readQuizResults } from '../../utils/storage';

export default function Progres() {
  const [results] = useState(readQuizResults);
  const attempts = results.attempts ?? {};
  const completed = useMemo(() => quizTopics.filter((topic) => Boolean(attempts[topic.id]?.assessment)).length, [attempts]);
  const percentage = Math.round((completed / quizTopics.length) * 100);
  return <DashboardLayout>
    <div className="mx-auto max-w-5xl space-y-6 font-poppins text-[#2A42A1]">
      <header className="rounded-[26px] bg-gradient-to-r from-[#D6E8FF] to-[#C9E9FF] p-7">
        <h1 className="text-3xl font-extrabold">Progres Belajar</h1>
        <p className="mt-2 text-sm">Pantau materi yang sudah kamu selesaikan.</p>
      </header>
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between"><div><p className="text-sm font-bold text-slate-500">Materi selesai</p><p className="mt-1 text-4xl font-extrabold">{completed}<span className="text-xl text-slate-400">/{quizTopics.length}</span></p></div><p className="text-2xl font-extrabold text-[#3A81DA]">{percentage}%</p></div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#4D80E8]" style={{ width: `${percentage}%` }} /></div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        {quizTopics.map((topic) => {
          const done = Boolean(attempts[topic.id]?.assessment);
          return <article key={topic.id} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"><div><h2 className="font-extrabold">{topic.name}</h2><p className="mt-1 text-xs text-slate-500">{done ? 'Tes telah diselesaikan' : 'Belum dikerjakan'}</p></div><span className={`rounded-full px-3 py-2 text-xs font-bold ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{done ? 'Selesai' : 'Belum'}</span></article>;
        })}
      </section>
      <p className="rounded-xl bg-blue-50 p-4 text-sm text-[#45649B]">Hasil nilai, persentase penguasaan P-DINA, dan laporan AI hanya tersedia untuk guru.</p>
      <Link to="/katalog" className="inline-flex rounded-xl bg-[#4D73EC] px-5 py-3 text-sm font-bold text-white">Pilih materi</Link>
    </div>
  </DashboardLayout>;
}
