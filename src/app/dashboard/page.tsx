"use client";

import { useState } from "react";
import { Loader2, FileDown, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function Dashboard() {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("Fase A (Kelas 1-2)");
  const [docType, setDocType] = useState("Modul Ajar");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, grade, docType }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data.content);
      } else {
        alert("Gagal memuat dari AI: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("document-content");
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `${docType.replace(" ", "_")}_${topic}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-xl text-slate-800">Ruang Kerja Guru</h1>
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            Kurikulum Merdeka Mode
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORM SIDE */}
        <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 self-start">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Parameter Dokumen</h2>
            <p className="text-sm text-slate-500">Sesuaikan dengan materi yang akan diajarkan.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Jenis Dokumen</label>
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Modul Ajar">Modul Ajar (RPP Plus)</option>
                <option value="RPP">RPP Sederhana</option>
                <option value="LKPD">LKPD (Lembar Kerja)</option>
                <option value="Jurnal Harian">Jurnal Harian</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Fase / Kelas</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</option>
                <option value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</option>
                <option value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</option>
                <option value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</option>
                <option value="Fase E (Kelas 10 SMA)">Fase E (Kelas 10 SMA)</option>
                <option value="Fase F (Kelas 11-12 SMA)">Fase F (Kelas 11-12 SMA)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Topik / Materi Pembelajaran</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Mengidentifikasi bagian tubuh tumbuhan dan fungsinya..."
                className="w-full p-3 border border-slate-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !topic}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "AI Sedang Berpikir..." : "Generate Dokumen"}
            </button>
          </form>
        </div>

        {/* PREVIEW SIDE */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Preview Dokumen</h3>
                <button 
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Unduh PDF
                </button>
              </div>
              <div className="p-8 prose prose-slate max-w-none" id="document-content" dangerouslySetInnerHTML={{ __html: result }}>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <FileText className="w-16 h-16 mb-4 text-slate-300" />
              <p>Isi form di samping lalu klik generate untuk membuat dokumen Kurikulum Merdeka.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
