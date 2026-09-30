"use client";

import { useState, useCallback } from "react";
import {
  Loader2, FileDown, ArrowLeft, Send, FileText,
  AlertCircle, RefreshCw, Plus, Trash2, Upload, X,
  ChevronRight, BookOpen
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type DocType =
  | "Rincian Minggu Efektif"
  | "Analisis Capaian Pembelajaran"
  | "Rencana Pembelajaran Mendalam"
  | "RPP Cinta Kemenag"
  | "Rencana Pembelajaran Mendalam Kokulikuler"
  | "LKPD"
  | "Asesmen Lengkap"
  | "Jurnal Harian";

interface Elemen {
  nama: string;
  deskripsi: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const DOC_TYPES: { label: string; value: DocType; icon: string }[] = [
  { label: "Rincian Minggu Efektif",                   value: "Rincian Minggu Efektif",                     icon: "📅" },
  { label: "Analisis Capaian Pembelajaran",             value: "Analisis Capaian Pembelajaran",              icon: "🔍" },
  { label: "Rencana Pembelajaran Mendalam",             value: "Rencana Pembelajaran Mendalam",              icon: "📖" },
  { label: "RPP Cinta Kemenag",                        value: "RPP Cinta Kemenag",                          icon: "🕌" },
  { label: "Rencana Pembelajaran Mendalam Kokulikuler", value: "Rencana Pembelajaran Mendalam Kokulikuler", icon: "🌐" },
  { label: "LKPD",                                     value: "LKPD",                                       icon: "📝" },
  { label: "Asesmen Lengkap",                          value: "Asesmen Lengkap",                            icon: "✅" },
  { label: "Jurnal Harian",                            value: "Jurnal Harian",                              icon: "📓" },
];

const FASE_OPTIONS = ["Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F"];
const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK"];
const KKTP_OPTIONS = [
  "4 Rentang Nilai (Perlu Bimbingan / Cukup / Baik / Sangat Baik)",
  "Rubrik Detail (Instrumen)",
];

// ─────────────────────────────────────────────────────────────────────────────
// Reusable form components
// ─────────────────────────────────────────────────────────────────────────────
function FormField({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
    />
  );
}

function SelectField({
  options, value, onChange, placeholder,
}: {
  options: string[]; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TextareaField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
    />
  );
}

function UploadField({
  accept, label, value, onChange,
}: {
  accept: string; label: string; value: File | null; onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
        {value ? (
          <div className="flex items-center gap-2 px-4">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-slate-700 truncate max-w-[200px]">{value.name}</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(null); }}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="w-6 h-6 text-slate-400" />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Form Components
// ─────────────────────────────────────────────────────────────────────────────
function FormRincianMinggu({
  onSubmit, loading,
}: {
  onSubmit: (payload: Record<string, any>) => void; loading: boolean;
}) {
  const [kalender, setKalender] = useState<File | null>(null);
  const [namaSekolah, setNamaSekolah] = useState("");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const [jpMinggu, setJpMinggu] = useState("");
  const [tahunPel, setTahunPel] = useState("");
  const [tempat, setTempat] = useState("");
  const [namaKepsek, setNamaKepsek] = useState("");
  const [nipKepsek, setNipKepsek] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [nipGuru, setNipGuru] = useState("");
  const [catatan, setCatatan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      docType: "Rincian Minggu Efektif",
      namaSekolah, kelas, mapel, jpMinggu, tahunPel, tempat,
      namaKepsek, nipKepsek, namaGuru, nipGuru, catatan,
      kalenderNama: kalender?.name ?? null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Kalender Pendidikan" hint="Format: JPG, PNG, PDF, DOCX. Akan dijadikan bahan analisis oleh AI.">
        <UploadField
          accept=".jpg,.jpeg,.png,.pdf,.docx"
          label="Klik untuk unggah kalender pendidikan"
          value={kalender}
          onChange={setKalender}
        />
      </FormField>

      <SectionDivider title="Identitas" />
      <FormField label="Nama Sekolah" required>
        <InputField value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} placeholder="Contoh: SDN 7 Pedungan" required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Kelas" required>
          <InputField value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Contoh: IV A" required />
        </FormField>
        <FormField label="JP per Minggu" required>
          <InputField type="number" value={jpMinggu} onChange={(e) => setJpMinggu(e.target.value)} placeholder="Contoh: 4" required />
        </FormField>
      </div>
      <FormField label="Mata Pelajaran" required>
        <InputField value={mapel} onChange={(e) => setMapel(e.target.value)} placeholder="Contoh: Pendidikan Jasmani" required />
      </FormField>
      <FormField label="Tahun Pelajaran">
        <InputField value={tahunPel} onChange={(e) => setTahunPel(e.target.value)} placeholder="Contoh: 2025/2026" />
      </FormField>
      <FormField label="Tempat Penandatanganan">
        <InputField value={tempat} onChange={(e) => setTempat(e.target.value)} placeholder="Contoh: Denpasar" />
      </FormField>

      <SectionDivider title="Data Pengesahan" />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nama Kepala Sekolah">
          <InputField value={namaKepsek} onChange={(e) => setNamaKepsek(e.target.value)} placeholder="Nama Kepsek" />
        </FormField>
        <FormField label="NIP Kepala Sekolah">
          <InputField value={nipKepsek} onChange={(e) => setNipKepsek(e.target.value)} placeholder="NIP Kepsek" />
        </FormField>
        <FormField label="Nama Guru">
          <InputField value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} placeholder="Nama Guru" />
        </FormField>
        <FormField label="NIP Guru">
          <InputField value={nipGuru} onChange={(e) => setNipGuru(e.target.value)} placeholder="NIP Guru" />
        </FormField>
      </div>

      <SectionDivider title="Catatan" />
      <FormField label="Catatan Tambahan">
        <TextareaField rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan khusus untuk dipertimbangkan AI..." />
      </FormField>

      <SubmitButton loading={loading} />
    </form>
  );
}

function FormAnalisisCP({
  onSubmit, loading,
}: {
  onSubmit: (payload: Record<string, any>) => void; loading: boolean;
}) {
  const [mapel, setMapel] = useState("");
  const [jenjang, setJenjang] = useState("");
  const [kelas, setKelas] = useState("");
  const [fase, setFase] = useState("");
  const [namaKepsek, setNamaKepsek] = useState("");
  const [nipKepsek, setNipKepsek] = useState("");
  const [kota, setKota] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [nipGuru, setNipGuru] = useState("");
  const [pekanEfektif, setPekanEfektif] = useState("");
  const [jpPerPekan, setJpPerPekan] = useState("");
  const [totalJp, setTotalJp] = useState("");
  const [jumlahBab, setJumlahBab] = useState("");
  const [elemen, setElemen] = useState<Elemen[]>([{ nama: "", deskripsi: "" }]);
  const [topik, setTopik] = useState("");
  const [referensi, setReferensi] = useState<File | null>(null);
  const [kktp, setKktp] = useState(KKTP_OPTIONS[0]);
  const [protaProsem, setProtaProsem] = useState(false);

  // Auto-calculate total JP
  const handlePekanChange = (v: string) => {
    setPekanEfektif(v);
    if (v && jpPerPekan) setTotalJp(String(parseInt(v) * parseInt(jpPerPekan)));
  };
  const handleJpPekanChange = (v: string) => {
    setJpPerPekan(v);
    if (v && pekanEfektif) setTotalJp(String(parseInt(pekanEfektif) * parseInt(v)));
  };

  const addElemen = () => setElemen([...elemen, { nama: "", deskripsi: "" }]);
  const removeElemen = (idx: number) => setElemen(elemen.filter((_, i) => i !== idx));
  const updateElemen = (idx: number, field: keyof Elemen, val: string) => {
    const updated = [...elemen];
    updated[idx][field] = val;
    setElemen(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      docType: "Analisis Capaian Pembelajaran",
      mapel, jenjang, kelas, fase,
      namaKepsek, nipKepsek, kota, namaGuru, nipGuru,
      pekanEfektif, jpPerPekan, totalJp, jumlahBab,
      elemen, topik, referensiNama: referensi?.name ?? null,
      kktp, protaProsem,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionDivider title="Identitas Mata Pelajaran" />
      <FormField label="Mata Pelajaran" required>
        <InputField value={mapel} onChange={(e) => setMapel(e.target.value)} placeholder="Contoh: Matematika" required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Jenjang" required>
          <SelectField options={JENJANG_OPTIONS} value={jenjang} onChange={setJenjang} placeholder="Pilih Jenjang" />
        </FormField>
        <FormField label="Kelas" required>
          <InputField value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Contoh: VII" required />
        </FormField>
      </div>
      <FormField label="Fase" required>
        <SelectField options={FASE_OPTIONS} value={fase} onChange={setFase} placeholder="Pilih Fase" />
      </FormField>

      <SectionDivider title="Data Penandatanganan" />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nama Kepala Sekolah">
          <InputField value={namaKepsek} onChange={(e) => setNamaKepsek(e.target.value)} placeholder="Nama Kepsek" />
        </FormField>
        <FormField label="NIP Kepala Sekolah">
          <InputField value={nipKepsek} onChange={(e) => setNipKepsek(e.target.value)} placeholder="NIP" />
        </FormField>
        <FormField label="Nama Guru">
          <InputField value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} placeholder="Nama Guru" />
        </FormField>
        <FormField label="NIP Guru">
          <InputField value={nipGuru} onChange={(e) => setNipGuru(e.target.value)} placeholder="NIP" />
        </FormField>
      </div>
      <FormField label="Kota">
        <InputField value={kota} onChange={(e) => setKota(e.target.value)} placeholder="Contoh: Denpasar" />
      </FormField>

      <SectionDivider title="Jam Pelajaran" />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Jumlah Pekan Efektif" required>
          <InputField type="number" value={pekanEfektif} onChange={(e) => handlePekanChange(e.target.value)} placeholder="Contoh: 18" required />
        </FormField>
        <FormField label="JP per Pekan" required>
          <InputField type="number" value={jpPerPekan} onChange={(e) => handleJpPekanChange(e.target.value)} placeholder="Contoh: 4" required />
        </FormField>
      </div>
      <FormField label="Total JP Setahun" required hint="Auto-hitung: Pekan × JP per Pekan. Bisa diubah manual.">
        <InputField type="number" value={totalJp} onChange={(e) => setTotalJp(e.target.value)} placeholder="Total JP" required />
      </FormField>
      <FormField label="Jumlah BAB Target">
        <InputField type="number" value={jumlahBab} onChange={(e) => setJumlahBab(e.target.value)} placeholder="Contoh: 6" />
      </FormField>

      <SectionDivider title="Elemen & Deskripsi CP" />
      {elemen.map((el, idx) => (
        <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600">ELEMEN {idx + 1}</span>
            {elemen.length > 1 && (
              <button type="button" onClick={() => removeElemen(idx)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <InputField
            value={el.nama}
            onChange={(e) => updateElemen(idx, "nama", e.target.value)}
            placeholder="Nama Elemen (contoh: Bilangan)"
            required
          />
          <TextareaField
            rows={3}
            value={el.deskripsi}
            onChange={(e) => updateElemen(idx, "deskripsi", e.target.value)}
            placeholder="Deskripsi Capaian Pembelajaran untuk elemen ini..."
            required
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addElemen}
        className="w-full py-2 border-2 border-dashed border-blue-300 rounded-lg text-sm text-blue-600 font-medium hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" /> Tambah Elemen
      </button>

      <SectionDivider title="Konteks & Referensi" />
      <FormField label="Konteks/Topik Pembelajaran">
        <TextareaField
          rows={3}
          value={topik}
          onChange={(e) => setTopik(e.target.value)}
          placeholder="Konteks atau tema besar yang akan dipelajari..."
        />
      </FormField>
      <FormField
        label="Upload Referensi (ATP/Silabus/Buku)"
        hint="PDF berbasis teks, DOCX, atau TXT. Maks 5MB. PDF hasil scan tidak didukung."
      >
        <UploadField
          accept=".pdf,.docx,.txt"
          label="Klik untuk unggah referensi (opsional)"
          value={referensi}
          onChange={setReferensi}
        />
      </FormField>

      <SectionDivider title="Pengaturan Output" />
      <FormField label="Format KKTP (Kriteria Ketercapaian TP)">
        <SelectField options={KKTP_OPTIONS} value={kktp} onChange={setKktp} />
      </FormField>

      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <input
          type="checkbox"
          id="prota-prosem"
          checked={protaProsem}
          onChange={(e) => setProtaProsem(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-blue-600"
        />
        <label htmlFor="prota-prosem" className="text-sm text-slate-700 cursor-pointer">
          <span className="font-semibold">Sertakan PROTA & PROSEM</span>
          <p className="text-xs text-slate-500 mt-1">
            Saat aktif, AI juga akan menghasilkan Program Tahunan (PROTA) dan Program Semester (PROSEM)
            dalam 1 file terpadu, otomatis menggunakan TP hasil Analisis CP.
          </p>
        </label>
      </div>

      <SubmitButton loading={loading} />
    </form>
  );
}

// Generic form for the remaining doc types
function FormGeneric({
  docType, onSubmit, loading,
}: {
  docType: DocType; onSubmit: (payload: Record<string, any>) => void; loading: boolean;
}) {
  const [namaSekolah, setNamaSekolah] = useState("");
  const [kelas, setKelas] = useState("");
  const [fase, setFase] = useState("Fase A");
  const [mapel, setMapel] = useState("");
  const [topik, setTopik] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [catatan, setCatatan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ docType, namaSekolah, kelas, fase, mapel, topik, namaGuru, catatan });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nama Sekolah">
        <InputField value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} placeholder="Contoh: SDN 7 Pedungan" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Fase">
          <SelectField options={FASE_OPTIONS} value={fase} onChange={setFase} />
        </FormField>
        <FormField label="Kelas" required>
          <InputField value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Contoh: IV A" required />
        </FormField>
      </div>
      <FormField label="Mata Pelajaran" required>
        <InputField value={mapel} onChange={(e) => setMapel(e.target.value)} placeholder="Mata Pelajaran" required />
      </FormField>
      <FormField label="Topik / Materi Pembelajaran" required>
        <TextareaField
          rows={4}
          value={topik}
          onChange={(e) => setTopik(e.target.value)}
          placeholder="Deskripsikan materi yang ingin dibuatkan dokumennya..."
          required
        />
      </FormField>
      <FormField label="Nama Guru">
        <InputField value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} placeholder="Nama Anda" />
      </FormField>
      <FormField label="Catatan Tambahan">
        <TextareaField rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Instruksi khusus untuk AI (opsional)..." />
      </FormField>
      <SubmitButton loading={loading} />
    </form>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      {loading ? "AI Sedang Membuat Dokumen..." : "Generate Dokumen"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = useCallback(async (payload: Record<string, any>) => {
    setLoading(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.content);
      } else {
        setErrorMsg(data.error || "Terjadi kesalahan yang tidak diketahui.");
      }
    } catch {
      setErrorMsg("Gagal menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadPDF = async () => {
    const element = document.getElementById("document-content");
    if (!element) return;
    const html2pdf = (await import("html2pdf.js" as any)).default;
    const opt: any = {
      margin: 10,
      filename: `${selectedDoc?.replace(/ /g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const renderForm = () => {
    if (!selectedDoc) return null;
    if (selectedDoc === "Rincian Minggu Efektif")
      return <FormRincianMinggu onSubmit={handleGenerate} loading={loading} />;
    if (selectedDoc === "Analisis Capaian Pembelajaran")
      return <FormAnalisisCP onSubmit={handleGenerate} loading={loading} />;
    return <FormGeneric docType={selectedDoc} onSubmit={handleGenerate} loading={loading} />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-slate-800 leading-tight">Ruang Kerja Guru</h1>
              {selectedDoc && (
                <p className="text-xs text-slate-500 leading-tight">
                  {DOC_TYPES.find(d => d.value === selectedDoc)?.icon} {selectedDoc}
                </p>
              )}
            </div>
          </div>
          <div className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            Kurikulum Merdeka Mode
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 py-6">
        {/* Doc Type Selector */}
        {!selectedDoc && (
          <div>
            <div className="text-center mb-8">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-slate-800">Pilih Jenis Dokumen</h2>
              <p className="text-slate-500 mt-1">Klik dokumen yang ingin Anda buat dengan bantuan AI</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  onClick={() => { setSelectedDoc(dt.value); setResult(null); setErrorMsg(null); }}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <span className="text-3xl">{dt.icon}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 leading-tight block">{dt.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form + Preview */}
        {selectedDoc && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* FORM */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-white text-sm">Parameter Dokumen</h2>
                    <p className="text-blue-200 text-xs mt-0.5">{selectedDoc}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedDoc(null); setResult(null); setErrorMsg(null); }}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 max-h-[calc(100vh-180px)] overflow-y-auto">
                  {renderForm()}
                </div>
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Gagal Generate</p>
                    <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>

            {/* PREVIEW */}
            <div className="lg:col-span-3">
              {result ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-20">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 text-sm">Preview Dokumen</h3>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Unduh PDF
                    </button>
                  </div>
                  <div
                    className="p-8 prose prose-slate max-w-none overflow-y-auto max-h-[calc(100vh-200px)]"
                    id="document-content"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed min-h-[500px] flex flex-col items-center justify-center text-slate-400 p-8 text-center sticky top-20">
                  {loading ? (
                    <>
                      <Loader2 className="w-14 h-14 mb-4 text-blue-400 animate-spin" />
                      <p className="font-medium text-slate-600">AI sedang menyusun dokumen...</p>
                      <p className="text-xs mt-1">Proses ini biasanya memakan 10–30 detik</p>
                    </>
                  ) : (
                    <>
                      <FileText className="w-14 h-14 mb-4 text-slate-300" />
                      <p className="font-medium">Dokumen akan tampil di sini</p>
                      <p className="text-xs mt-1">Isi form di samping lalu klik "Generate Dokumen"</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
