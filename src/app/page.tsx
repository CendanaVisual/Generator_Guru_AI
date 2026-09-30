import Link from "next/link";
import { BookOpen, FileText, Sparkles, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <BookOpen className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          STUPA <span className="text-blue-600">GURU AI</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Sistem Administrasi Pembelajaran Guru berbasis Kecerdasan Buatan. 
          Buat RPE, RPPM, Analisis CP, Modul Ajar, LKPD, Asesmen dan Jurnal sesuai Kurikulum Merdeka secara otomatis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Sparkles className="w-10 h-10 text-amber-500 mb-4 mx-auto" />
            <h3 className="font-bold text-lg mb-2">Didukung AI Pintar</h3>
            <p className="text-slate-500 text-sm">Menghasilkan dokumen berkualitas yang disesuaikan dengan profil sekolah dan capaian pembelajaran.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <BookOpen className="w-10 h-10 text-emerald-500 mb-4 mx-auto" />
            <h3 className="font-bold text-lg mb-2">Kurikulum Merdeka</h3>
            <p className="text-slate-500 text-sm">Format keluaran telah disesuaikan dengan standar terbaru dari Kemdikbudristek.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <FileText className="w-10 h-10 text-blue-500 mb-4 mx-auto" />
            <h3 className="font-bold text-lg mb-2">Ekspor ke PDF</h3>
            <p className="text-slate-500 text-sm">Dokumen langsung siap edit & cetak dengan format WORD/PDF dan desain yang rapi.</p>
          </div>
        </div>

        <div className="pt-10">
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
            <LogIn className="w-5 h-5" />
            Masuk ke Dashboard
          </Link>
        </div>
      </main>
      
      <footer className="mt-20 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Generator Guru AI. Cendana Visual.
      </footer>
    </div>
  );
}
