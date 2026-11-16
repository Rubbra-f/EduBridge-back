import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import bookMascot from '../../assets/images/mascots/book.png';
import { readQuizResults } from '../../utils/storage';

const categories = ['Semua Materi', 'Aljabar', 'Geometri', 'Fungsi', 'Statistik', 'Peluang'];
const lessons = [
  { id: 'aljabar', title: 'Persamaan Linear', category: 'Aljabar', description: 'Mengenal persamaan linear satu variabel', questions: 10, minutes: 15, symbol: '∑', tint: '#FFF0C3', icon: '#FFDC77' },
  { id: 'geometri', title: 'Bangun Datar', category: 'Geometri', description: 'Luas dan keliling bangun datar', questions: 12, minutes: 20, symbol: 'π', tint: '#D4DFF5', icon: '#7085CD' },
  { id: 'statistik', title: 'Statistika Dasar', category: 'Statistik', description: 'Rata-rata, median, dan modus', questions: 8, minutes: 15, symbol: '⌁', tint: '#F5DDEB', icon: '#F58CBB' },
  { id: 'fungsi', title: 'Pengenalan Fungsi', category: 'Fungsi', description: 'Memahami fungsi dan grafiknya', questions: 10, minutes: 15, symbol: 'ƒx', tint: '#CBEDEF', icon: '#67CEC6' },
  { id: 'peluang', title: 'Peluang Sederhana', category: 'Peluang', description: 'Menghitung peluang kejadian', questions: 10, minutes: 15, symbol: '◇', tint: '#E6DDF7', icon: '#B9A0ED' },
];
export default function KatalogMateri() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Semua Materi');
  const [search, setSearch] = useState('');
  const [results] = useState(readQuizResults);
  const filtered = useMemo(() => lessons.filter((lesson) =>
    (category === 'Semua Materi' || lesson.category === category)
    && `${lesson.title} ${lesson.description} ${lesson.category}`.toLowerCase().includes(search.toLowerCase())
  ), [category, search]);
  return <DashboardLayout><div className="mx-auto max-w-[1500px] space-y-6 font-poppins text-[#2A42A1]">
    <header className="relative flex min-h-[170px] items-center overflow-hidden rounded-[28px] bg-gradient-to-r from-[#DDF6FF] via-[#EFF9FF] to-[#C6E6FF] px-8 py-7 shadow-md"><div className="relative z-10 max-w-[72%]"><h1 className="mb-3 text-3xl font-extrabold md:text-4xl">Pilih Materi Belajar</h1><p className="text-sm font-semibold leading-relaxed">Pilih sendiri materi yang ingin kamu pelajari. Setiap materi memiliki satu tes diagnostik.</p></div><img src={bookMascot} alt="Astronaut membaca" className="absolute bottom-0 right-3 h-[145px] object-contain md:h-[170px]" /></header>
    <div className="flex flex-wrap gap-2">{categories.map((cat) => <button key={cat} type="button" onClick={() => setCategory(cat)} className={`rounded-full border px-4 py-3 text-xs font-semibold ${category === cat ? 'border-[#3A81DA] bg-[#3A81DA] text-white' : 'border-gray-300 bg-white text-[#253E8C]'}`}>{cat}</button>)}</div>
    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="🔎 Cari materi..." className="w-full rounded-2xl bg-white p-4 text-sm shadow-sm outline-none" />
    <div className="grid gap-4 lg:grid-cols-2">{filtered.map((lesson) => {
      const done = Boolean(results.attempts?.[lesson.id]?.assessment);
      return <article key={lesson.id} className="flex flex-col gap-4 rounded-2xl p-4 shadow-sm sm:flex-row sm:items-center" style={{ background: lesson.tint }}>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-4xl font-bold shadow-md" style={{ background: lesson.icon }}>{lesson.symbol}</div>
        <div className="min-w-0 flex-1"><h2 className="text-xl font-extrabold">{lesson.title}</h2><p className="text-xs text-gray-600">{lesson.description}</p><div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-gray-600"><span>▤ {lesson.questions} soal</span><span>◷ {lesson.minutes} menit</span><span>{lesson.category}</span></div><p className="mt-2 text-xs font-bold">{done ? '✓ Tes selesai' : 'Belum dikerjakan'}</p></div>
        <button type="button" onClick={() => navigate(`/kuis?subject=${lesson.id}`)} className="rounded-2xl border border-gray-300 bg-white px-4 py-3 font-bold text-[#3A81DA] shadow-md hover:bg-blue-50 sm:w-[170px]">{done ? 'Lihat Status' : 'Mulai Tes'}</button>
      </article>;
    })}{!filtered.length && <p className="rounded-2xl bg-white p-8 text-center">Materi tidak ditemukan.</p>}</div>
  </div></DashboardLayout>;
}
