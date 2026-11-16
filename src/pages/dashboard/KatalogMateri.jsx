import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchQuestionBank, groupQuestionsByConcept } from '../../services/assessmentApi';

export default function KatalogMateri() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Materi');

  useEffect(() => {
    const controller = new AbortController();
    fetchQuestionBank({ signal: controller.signal })
      .then(setItems)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const materials = useMemo(() => groupQuestionsByConcept(items), [items]);
  const categories = useMemo(() => ['Semua Materi', ...new Set(materials.map((item) => item.name))], [materials]);
  const filtered = materials.filter((item) => (
    (selectedCategory === 'Semua Materi' || item.name === selectedCategory)
    && item.name.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px] space-y-6 font-poppins text-[#2A42A1]">
        <header className="rounded-[26px] bg-gradient-to-r from-[#DDF6FF] to-[#C6E6FF] px-7 py-8 shadow-sm">
          <h1 className="text-3xl font-extrabold">Katalog Materi</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium">Pilih satu konsep matematika untuk mengerjakan assessment berdasarkan bank soal EduBridge.</p>
        </header>
        <label className="block rounded-2xl bg-white p-3 shadow-sm">
          <span className="sr-only">Cari materi</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama materi..." className="w-full p-2 text-sm outline-none" />
        </label>
        {!loading && !error && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`rounded-full border px-4 py-2 text-xs font-semibold ${selectedCategory === category ? 'border-[#3A81DA] bg-[#3A81DA] text-white' : 'border-gray-300 bg-white text-[#253E8C]'}`}>
                {category}
              </button>
            ))}
          </div>
        )}
        {loading && <div className="rounded-2xl bg-white p-8 text-center">Memuat katalog dari bank soal backend…</div>}
        {error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            <b>Katalog belum dapat dimuat.</b><p className="mt-1">{error}</p>
            <p className="mt-2">Pastikan proxy server-side dan API EduBridge sudah dikonfigurasi.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-lg bg-white px-4 py-2 font-bold">Coba lagi</button>
          </div>
        )}
        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((material, index) => (
              <article key={material.id} className="flex flex-col rounded-2xl border border-[#DCE6F2] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7F2FF] text-2xl font-bold text-[#4D78ED]">{index + 1}</span>
                  <span className="rounded-full bg-[#EDF6FF] px-3 py-1 text-xs font-bold text-[#3A81DA]">{material.questions.length} soal</span>
                </div>
                <h2 className="mt-4 text-lg font-extrabold">{material.name}</h2>
                <p className="mt-2 flex-1 text-sm text-slate-500">Soal bergambar dari bank soal backend, dikelompokkan berdasarkan konsep.</p>
                <button type="button" onClick={() => navigate(`/kuis?concept=${encodeURIComponent(material.name)}&mode=pretest`)} className="mt-5 rounded-xl bg-[#3A81DA] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2A42A1]">Mulai assessment →</button>
              </article>
            ))}
            {filtered.length === 0 && <p className="rounded-2xl bg-white p-8 text-center md:col-span-2 xl:col-span-3">Materi tidak ditemukan.</p>}
          </div>
        )}
        {!loading && !error && <p className="text-xs text-slate-500">Sumber: {items.length} soal dari endpoint bank soal backend.</p>}
      </div>
    </DashboardLayout>
  );
}
