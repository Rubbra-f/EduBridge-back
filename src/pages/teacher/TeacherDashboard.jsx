import DashboardLayout from '../../components/layout/DashboardLayout';

const cards = [
  { title: 'Jumlah Siswa', value: '—', detail: 'Data siswa akan tersedia setelah autentikasi dan database terhubung.' },
  { title: 'Assessment Selesai', value: '—', detail: 'Rekap pengerjaan assessment siswa.' },
  { title: 'Perlu Pendampingan', value: '—', detail: 'Siswa dengan konsep yang masih perlu diperkuat.' },
];

export default function TeacherDashboard() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px] space-y-6 font-poppins text-[#2A42A1]">
        <header className="rounded-[26px] bg-gradient-to-r from-[#DDF6FF] to-[#C6E6FF] p-8">
          <p className="text-sm font-bold text-[#4D78ED]">Area Pendidik</p>
          <h1 className="mt-2 text-3xl font-extrabold">Dashboard Guru</h1>
          <p className="mt-2 max-w-2xl text-sm">Ringkasan kelas, hasil assessment, dan kebutuhan pendampingan siswa.</p>
        </header>
        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-[#DCE6F2] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-500">{card.title}</h2>
              <p className="mt-3 text-3xl font-extrabold">{card.value}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.detail}</p>
            </article>
          ))}
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#DCE6F2] bg-white p-5">
            <h2 className="text-lg font-extrabold">Aktivitas Assessment</h2>
            <p className="mt-2 text-sm text-slate-500">Tabel aktivitas akan menampilkan siswa, materi, tanggal, dan status setelah layanan akun serta penyimpanan hasil tersedia.</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b text-slate-500"><th className="py-2">Siswa</th><th>Materi</th><th>Tanggal</th><th>Status</th></tr></thead>
                <tbody><tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada data aktivitas.</td></tr></tbody>
              </table>
            </div>
          </article>
          <article className="rounded-2xl border border-[#DCE6F2] bg-white p-5">
            <h2 className="text-lg font-extrabold">Konsep yang Perlu Diperhatikan</h2>
            <p className="mt-2 text-sm text-slate-500">Ringkasan learning gap dari hasil P-DINA akan ditampilkan di sini.</p>
            <div className="mt-5 rounded-xl bg-[#F3F8FF] p-5 text-center text-sm text-slate-500">Menunggu data diagnosis siswa.</div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}
