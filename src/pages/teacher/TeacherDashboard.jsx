import DashboardLayout from '../../components/layout/DashboardLayout';

export default function TeacherDashboard() {
  return <DashboardLayout>
    <div className="mx-auto max-w-6xl space-y-6 font-poppins text-[#2A42A1]">
      <header className="rounded-[26px] bg-gradient-to-r from-[#D6E8FF] to-[#C9E9FF] p-7">
        <p className="text-sm font-bold">Ruang Guru</p>
        <h1 className="mt-1 text-3xl font-extrabold">Dashboard Guru</h1>
        <p className="mt-2 max-w-2xl text-sm">Pantau perkembangan setiap siswa melalui hasil diagnostik P-DINA dan laporan analisis AI.</p>
      </header>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
        <h2 className="font-extrabold">Integrasi laporan belum aktif</h2>
        <p className="mt-2">Halaman ini adalah kerangka dashboard. Data siswa, persentase penguasaan P-DINA, dan laporan Gemini belum ditampilkan karena backend saat ini belum memiliki autentikasi berbasis peran, penyimpanan hasil per siswa, atau endpoint laporan guru yang aman.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[['Daftar siswa','Menunggu endpoint daftar siswa'],['Analisis P-DINA','Menunggu penyimpanan diagnosis'],['Laporan AI','Menunggu integrasi Gemini terverifikasi']].map(([title, description]) => <article key={title} className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-extrabold">{title}</h2><p className="mt-2 text-xs text-slate-500">{description}</p></article>)}
      </section>
    </div>
  </DashboardLayout>;
}
