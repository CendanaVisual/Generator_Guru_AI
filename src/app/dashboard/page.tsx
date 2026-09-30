"use client";

import React, { useState, useCallback, ReactNode, useRef } from "react";
import { 
  Loader2, FileDown, ArrowLeft, Send, FileText, AlertCircle, 
  Plus, Trash2, Upload, X, ChevronRight, BookOpen, Sparkles 
} from "lucide-react";
import Link from "next/link";

type DocType = 
  | "Rincian Minggu Efektif"
  | "Analisis Capaian Pembelajaran"
  | "Rencana Pembelajaran Mendalam"
  | "RPP Cinta Kemenag"
  | "Rencana Pembelajaran Mendalam Kokulikuler"
  | "LKPD"
  | "Asesmen Lengkap"
  | "Jurnal Harian";

const DOCUMENT_TYPES: { label: string; value: DocType; icon: string }[] = [
  { label: "Rincian Minggu Efektif", value: "Rincian Minggu Efektif", icon: "📅" },
  { label: "Analisis Capaian Pembelajaran", value: "Analisis Capaian Pembelajaran", icon: "🔍" },
  { label: "Rencana Pembelajaran Mendalam", value: "Rencana Pembelajaran Mendalam", icon: "📖" },
  { label: "RPP Cinta Kemenag", value: "RPP Cinta Kemenag", icon: "🕌" },
  { label: "Rencana Pembelajaran Mendalam Kokulikuler", value: "Rencana Pembelajaran Mendalam Kokulikuler", icon: "🌐" },
  { label: "LKPD", value: "LKPD", icon: "📝" },
  { label: "Asesmen Lengkap", value: "Asesmen Lengkap", icon: "✅" },
  { label: "Jurnal Harian", value: "Jurnal Harian", icon: "📓" }
];

const FASE_OPTIONS = ["Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F"];
const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK"];
const SEMESTER_OPTIONS = ["Ganjil", "Genap"];
const PERTEMUAN_OPTIONS = ["1 Pertemuan", "2 Pertemuan", "3 Pertemuan", "4 Pertemuan", "5 Pertemuan", "6 Pertemuan", "7 Pertemuan", "8 Pertemuan", "9 Pertemuan", "10 Pertemuan"];
const MODEL_PEMBELAJARAN_OPTIONS = ["Problem Based Learning (PBL)", "Project Based Learning (PjBL)", "Discovery Learning", "Inquiry Learning", "Cooperative Learning", "Contextual Teaching & Learning", "Differentiated Learning", "Blended Learning"];
const PENDEKATAN_OPTIONS = ["Standar", "Diferensiasi", "Integrasi Koding & Kecerdasan Artifisial", "Papan Interaktif Digital", "STEM", "STEAM"];
const KKTP_OPTIONS = ["4 Rentang Nilai (Perlu Bimbingan / Cukup / Baik / Sangat Baik)", "Rubrik Detail (Instrumen)"];
const DIMENSI_PROFIL = ["Beriman & Bertakwa kepada Tuhan YME", "Berakhlak Mulia", "Berkebinekaan Global", "Gotong Royong", "Mandiri", "Bernalar Kritis", "Kreatif", "Adaptif & Inovatif"];

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

const FormField = ({ label, required, hint, children }: FormFieldProps) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <span className="text-xs text-slate-400">{hint}</span>}
  </div>
);

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
    {...props}
  />
);

interface SelectFieldProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const SelectField = ({ options, value, onChange, placeholder }: SelectFieldProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const TextareaField = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all min-h-[100px]"
    {...props}
  />
);

interface UploadFieldProps {
  accept: string;
  label: string;
  value: File | null;
  onChange: (f: File | null) => void;
}

const UploadField = ({ accept, label, value, onChange }: UploadFieldProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer">
      <input 
        type="file" 
        accept={accept} 
        onChange={handleFileChange} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {value ? (
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            <span className="text-sm truncate max-w-[150px]">{value.name}</span>
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(null); }}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-slate-500 pointer-events-none">
          <Upload size={24} className="mb-2" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-slate-400 mt-1">Pilih file atau tarik ke sini</span>
        </div>
      )}
    </div>
  );
};

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center my-6">
    <div className="flex-grow border-t border-slate-200"></div>
    <span className="flex-shrink-0 mx-4 text-xs font-bold tracking-wider text-slate-400 uppercase">{title}</span>
    <div className="flex-grow border-t border-slate-200"></div>
  </div>
);

const SubmitButton = ({ loading }: { loading: boolean }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
  >
    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
    <span>{loading ? "Memproses..." : "Buat Dokumen"}</span>
  </button>
);

// --- FORMS ---

interface FormProps {
  onSubmit: (payload: Record<string, any>) => void;
  loading: boolean;
}

const FormRincianMinggu = ({ onSubmit, loading }: FormProps) => {
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
      kalenderNama: kalender?.name ?? null,
      namaSekolah, kelas, mapel, jpMinggu, tahunPel, tempat,
      namaKepsek, nipKepsek, namaGuru, nipGuru, catatan
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-1">
      <SectionDivider title="Data Utama" />
      <FormField label="Kalender Akademik">
        <UploadField accept=".jpg,.jpeg,.png,.pdf,.docx" label="Upload Kalender" value={kalender} onChange={setKalender} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Sekolah" required>
          <InputField value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} required />
        </FormField>
        <FormField label="Kelas" required>
          <InputField value={kelas} onChange={(e) => setKelas(e.target.value)} required />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Mata Pelajaran" required>
          <InputField value={mapel} onChange={(e) => setMapel(e.target.value)} required />
        </FormField>
        <FormField label="JP per Minggu" required>
          <InputField type="number" value={jpMinggu} onChange={(e) => setJpMinggu(e.target.value)} required />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Tahun Pelajaran">
          <InputField value={tahunPel} onChange={(e) => setTahunPel(e.target.value)} />
        </FormField>
        <FormField label="Tempat (Kota/Kab)">
          <InputField value={tempat} onChange={(e) => setTempat(e.target.value)} />
        </FormField>
      </div>

      <SectionDivider title="Data Pengesahan" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Kepala Sekolah">
          <InputField value={namaKepsek} onChange={(e) => setNamaKepsek(e.target.value)} />
        </FormField>
        <FormField label="NIP Kepala Sekolah">
          <InputField value={nipKepsek} onChange={(e) => setNipKepsek(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Guru">
          <InputField value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} />
        </FormField>
        <FormField label="NIP Guru">
          <InputField value={nipGuru} onChange={(e) => setNipGuru(e.target.value)} />
        </FormField>
      </div>

      <SectionDivider title="Tambahan" />
      <FormField label="Catatan Tambahan">
        <TextareaField value={catatan} onChange={(e) => setCatatan(e.target.value)} />
      </FormField>

      <SubmitButton loading={loading} />
    </form>
  );
};

interface ElemenCP {
  nama: string;
  deskripsi: string;
}

const FormAnalisisCP = ({ onSubmit, loading }: FormProps) => {
  const [mapel, setMapel] = useState("");
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [kelas, setKelas] = useState("");
  const [fase, setFase] = useState(FASE_OPTIONS[0]);
  const [namaKepsek, setNamaKepsek] = useState("");
  const [nipKepsek, setNipKepsek] = useState("");
  const [kota, setKota] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [nipGuru, setNipGuru] = useState("");
  const [pekanEfektif, setPekanEfektif] = useState("");
  const [jpPerPekan, setJpPerPekan] = useState("");
  const [totalJp, setTotalJp] = useState("");
  const [jumlahBab, setJumlahBab] = useState("");
  const [elemen, setElemen] = useState<ElemenCP[]>([{ nama: "", deskripsi: "" }]);
  const [topik, setTopik] = useState("");
  const [referensi, setReferensi] = useState<File | null>(null);
  const [kktp, setKktp] = useState(KKTP_OPTIONS[0]);
  const [protaProsem, setProtaProsem] = useState(false);

  // Auto calculate total JP
  const handlePekanChange = (val: string) => {
    setPekanEfektif(val);
    if (val && jpPerPekan) setTotalJp(String(Number(val) * Number(jpPerPekan)));
  };
  const handleJpChange = (val: string) => {
    setJpPerPekan(val);
    if (val && pekanEfektif) setTotalJp(String(Number(pekanEfektif) * Number(val)));
  };

  const addElemen = () => setElemen([...elemen, { nama: "", deskripsi: "" }]);
  const removeElemen = (index: number) => setElemen(elemen.filter((_, i) => i !== index));
  const updateElemen = (index: number, field: keyof ElemenCP, value: string) => {
    const newElemen = [...elemen];
    newElemen[index][field] = value;
    setElemen(newElemen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      docType: "Analisis Capaian Pembelajaran",
      mapel, jenjang, kelas, fase,
      namaKepsek, nipKepsek, kota, namaGuru, nipGuru,
      pekanEfektif, jpPerPekan, totalJp, jumlahBab,
      elemen, topik, referensiNama: referensi?.name ?? null, kktp, protaProsem
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-1">
      <SectionDivider title="Identitas" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Mata Pelajaran" required>
          <InputField value={mapel} onChange={(e) => setMapel(e.target.value)} required />
        </FormField>
        <FormField label="Jenjang">
          <SelectField options={JENJANG_OPTIONS} value={jenjang} onChange={setJenjang} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kelas" required>
          <InputField value={kelas} onChange={(e) => setKelas(e.target.value)} required />
        </FormField>
        <FormField label="Fase">
          <SelectField options={FASE_OPTIONS} value={fase} onChange={setFase} />
        </FormField>
      </div>

      <SectionDivider title="Analisis Waktu" />
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Pekan Efektif" required>
          <InputField type="number" value={pekanEfektif} onChange={(e) => handlePekanChange(e.target.value)} required />
        </FormField>
        <FormField label="JP / Pekan" required>
          <InputField type="number" value={jpPerPekan} onChange={(e) => handleJpChange(e.target.value)} required />
        </FormField>
        <FormField label="Total JP" required>
          <InputField type="number" value={totalJp} onChange={(e) => setTotalJp(e.target.value)} required />
        </FormField>
      </div>
      <FormField label="Jumlah Bab (Opsional)">
        <InputField type="number" value={jumlahBab} onChange={(e) => setJumlahBab(e.target.value)} />
      </FormField>

      <SectionDivider title="Elemen Capaian" />
      {elemen.map((el, idx) => (
        <div key={idx} className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
          <div className="absolute top-2 right-2">
            {elemen.length > 1 && (
              <button type="button" onClick={() => removeElemen(idx)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <FormField label={`Nama Elemen ${idx + 1}`}>
            <InputField value={el.nama} onChange={(e) => updateElemen(idx, "nama", e.target.value)} />
          </FormField>
          <FormField label="Deskripsi">
            <TextareaField value={el.deskripsi} onChange={(e) => updateElemen(idx, "deskripsi", e.target.value)} />
          </FormField>
        </div>
      ))}
      <button type="button" onClick={addElemen} className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:underline">
        <Plus size={16} /> Tambah Elemen
      </button>

      <SectionDivider title="Materi & Pengaturan" />
      <FormField label="Topik Pembelajaran">
        <TextareaField value={topik} onChange={(e) => setTopik(e.target.value)} />
      </FormField>
      <FormField label="Referensi Dokumen CP (Opsional)">
        <UploadField accept=".pdf,.docx,.txt" label="Upload Referensi" value={referensi} onChange={setReferensi} />
      </FormField>
      <FormField label="Kriteria Ketercapaian (KKTP)">
        <SelectField options={KKTP_OPTIONS} value={kktp} onChange={setKktp} />
      </FormField>
      <div className="flex items-center gap-2 mt-4 mb-2">
        <input 
          type="checkbox" 
          id="protaProsem" 
          checked={protaProsem} 
          onChange={(e) => setProtaProsem(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
        <label htmlFor="protaProsem" className="text-sm font-medium text-slate-700">Sertakan Program Tahunan & Semester (Prota/Prosem)</label>
      </div>

      <SectionDivider title="Data Pengesahan" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kota">
          <InputField value={kota} onChange={(e) => setKota(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Kepala Sekolah">
          <InputField value={namaKepsek} onChange={(e) => setNamaKepsek(e.target.value)} />
        </FormField>
        <FormField label="NIP Kepala Sekolah">
          <InputField value={nipKepsek} onChange={(e) => setNipKepsek(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Guru">
          <InputField value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} />
        </FormField>
        <FormField label="NIP Guru">
          <InputField value={nipGuru} onChange={(e) => setNipGuru(e.target.value)} />
        </FormField>
      </div>

      <SubmitButton loading={loading} />
    </form>
  );
};

const FormRPM = ({ onSubmit, loading }: FormProps) => {
  const [mapel, setMapel] = useState("");
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [kelas, setKelas] = useState("");
  const [fase, setFase] = useState(FASE_OPTIONS[0]);
  const [semester, setSemester] = useState(SEMESTER_OPTIONS[0]);
  const [tahunPelajaran, setTahunPelajaran] = useState("");
  const [alokasiWaktu, setAlokasiWaktu] = useState("");
  const [jumlahPertemuan, setJumlahPertemuan] = useState(PERTEMUAN_OPTIONS[0]);
  const [modelPembelajaran, setModelPembelajaran] = useState(MODEL_PEMBELAJARAN_OPTIONS[0]);
  const [pendekatanKhusus, setPendekatanKhusus] = useState(PENDEKATAN_OPTIONS[0]);
  const [topikUtama, setTopikUtama] = useState("");
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState("");
  const [gayaBahasa, setGayaBahasa] = useState("Sederhana");
  const [gayaPenyusunan, setGayaPenyusunan] = useState("Format Tabel Resmi");
  const [dimensiProfil, setDimensiProfil] = useState<string[]>([]);
  const [detailMateri, setDetailMateri] = useState("");
  const [orientasi, setOrientasi] = useState("Portrait");
  const [namaKepsek, setNamaKepsek] = useState("");
  const [nipKepsek, setNipKepsek] = useState("");
  const [kota, setKota] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [nipGuru, setNipGuru] = useState("");
  
  const [aiLoading, setAiLoading] = useState(false);

  const handleDimensiChange = (dimensi: string) => {
    setDimensiProfil(prev => 
      prev.includes(dimensi) ? prev.filter(d => d !== dimensi) : [...prev, dimensi]
    );
  };

  const handleAIGenerate = async () => {
    if (!tujuanPembelajaran) {
      alert("Isi Tujuan Pembelajaran terlebih dahulu");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'generate-materi', tujuanPembelajaran, jumlahPertemuan })
      });
      if (res.ok) {
        const data = await res.json();
        setDetailMateri(data.result || "Tidak ada hasil");
      } else {
        alert("Gagal menghasilkan materi dari AI");
      }
    } catch (e) {
      alert("Error menghubungi server AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dimensiProfil.length < 4) {
      alert("Pilih minimal 4 Dimensi Profil Pelajar Pancasila");
      return;
    }
    onSubmit({
      docType: "Rencana Pembelajaran Mendalam",
      mapel, jenjang, kelas, fase, semester, tahunPelajaran, alokasiWaktu, jumlahPertemuan,
      modelPembelajaran, pendekatanKhusus, topikUtama, tujuanPembelajaran, gayaBahasa,
      gayaPenyusunan, dimensiProfil, detailMateri, orientasi,
      namaKepsek, nipKepsek, kota, namaGuru, nipGuru
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-1">
      <SectionDivider title="Data Umum" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Mata Pelajaran" required>
          <InputField value={mapel} onChange={(e) => setMapel(e.target.value)} required />
        </FormField>
        <FormField label="Jenjang">
          <SelectField options={JENJANG_OPTIONS} value={jenjang} onChange={setJenjang} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kelas" required>
          <InputField value={kelas} onChange={(e) => setKelas(e.target.value)} required />
        </FormField>
        <FormField label="Fase">
          <SelectField options={FASE_OPTIONS} value={fase} onChange={setFase} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Semester">
          <SelectField options={SEMESTER_OPTIONS} value={semester} onChange={setSemester} />
        </FormField>
        <FormField label="Tahun Pelajaran">
          <InputField value={tahunPelajaran} onChange={(e) => setTahunPelajaran(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Alokasi Waktu" required hint="Contoh: 4x35 menit">
          <InputField value={alokasiWaktu} onChange={(e) => setAlokasiWaktu(e.target.value)} placeholder="4x35 menit" required />
        </FormField>
        <FormField label="Jumlah Pertemuan">
          <SelectField options={PERTEMUAN_OPTIONS} value={jumlahPertemuan} onChange={setJumlahPertemuan} />
        </FormField>
      </div>

      <SectionDivider title="Desain Pembelajaran" />
      <FormField label="Topik Utama" required>
        <InputField value={topikUtama} onChange={(e) => setTopikUtama(e.target.value)} required />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Model Pembelajaran">
          <SelectField options={MODEL_PEMBELAJARAN_OPTIONS} value={modelPembelajaran} onChange={setModelPembelajaran} />
        </FormField>
        <FormField label="Pendekatan Khusus">
          <SelectField options={PENDEKATAN_OPTIONS} value={pendekatanKhusus} onChange={setPendekatanKhusus} />
        </FormField>
      </div>
      <FormField label="Tujuan Pembelajaran" required>
        <TextareaField value={tujuanPembelajaran} onChange={(e) => setTujuanPembelajaran(e.target.value)} required />
      </FormField>

      <SectionDivider title="Pengaturan Dokumen" />
      <FormField label="Gaya Bahasa">
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="gayaBahasa" value="Sederhana" checked={gayaBahasa === "Sederhana"} onChange={() => setGayaBahasa("Sederhana")} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-sm">Sederhana</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="gayaBahasa" value="Formal Akademis" checked={gayaBahasa === "Formal Akademis"} onChange={() => setGayaBahasa("Formal Akademis")} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-sm">Formal Akademis</span>
          </label>
        </div>
      </FormField>
      <FormField label="Gaya Penyusunan">
        <div className="flex flex-col gap-3 mt-1">
          <label className="flex items-start gap-2 cursor-pointer border p-3 rounded-lg hover:bg-slate-50">
            <input type="radio" name="gayaPenyusunan" value="Format Tabel Resmi" checked={gayaPenyusunan === "Format Tabel Resmi"} onChange={() => setGayaPenyusunan("Format Tabel Resmi")} className="mt-1 text-blue-600 focus:ring-blue-500" />
            <div>
              <div className="text-sm font-medium">Format Tabel Resmi</div>
              <div className="text-xs text-slate-500 mt-1">Komponen A–F dalam matriks dua kolom. Rapi & seragam saat dicetak.</div>
            </div>
          </label>
          <label className="flex items-start gap-2 cursor-pointer border p-3 rounded-lg hover:bg-slate-50">
            <input type="radio" name="gayaPenyusunan" value="Format Naratif Klasik" checked={gayaPenyusunan === "Format Naratif Klasik"} onChange={() => setGayaPenyusunan("Format Naratif Klasik")} className="mt-1 text-blue-600 focus:ring-blue-500" />
            <div>
              <div className="text-sm font-medium">Format Naratif Klasik</div>
              <div className="text-xs text-slate-500 mt-1">Nomor Romawi I–VI dengan uraian paragraf dan daftar.</div>
            </div>
          </label>
        </div>
      </FormField>
      <FormField label="Orientasi Kertas">
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="orientasi" value="Portrait" checked={orientasi === "Portrait"} onChange={() => setOrientasi("Portrait")} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-sm">Portrait</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="orientasi" value="Landscape" checked={orientasi === "Landscape"} onChange={() => setOrientasi("Landscape")} className="text-blue-600 focus:ring-blue-500" />
            <span className="text-sm">Landscape</span>
          </label>
        </div>
      </FormField>

      <SectionDivider title="Dimensi Profil Pelajar Pancasila" />
      <div className="mb-4">
        <label className="text-sm font-semibold text-slate-700 block mb-2">Pilih Dimensi (Min. 4) <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-2">
          {DIMENSI_PROFIL.map(dimensi => (
            <label key={dimensi} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" checked={dimensiProfil.includes(dimensi)} onChange={() => handleDimensiChange(dimensi)} className="text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <span className="text-xs">{dimensi}</span>
            </label>
          ))}
        </div>
      </div>

      <SectionDivider title="Detail Materi" />
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-slate-700">Detail Materi</label>
          <button type="button" onClick={handleAIGenerate} disabled={aiLoading} className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full font-medium transition-colors">
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {aiLoading ? "Berpikir..." : "✨ Hasilkan dari AI"}
          </button>
        </div>
        <TextareaField value={detailMateri} onChange={(e) => setDetailMateri(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all min-h-[150px]" />
      </div>

      <SectionDivider title="Data Pengesahan" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Kota">
          <InputField value={kota} onChange={(e) => setKota(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Kepala Sekolah">
          <InputField value={namaKepsek} onChange={(e) => setNamaKepsek(e.target.value)} />
        </FormField>
        <FormField label="NIP Kepala Sekolah">
          <InputField value={nipKepsek} onChange={(e) => setNipKepsek(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Guru">
          <InputField value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} />
        </FormField>
        <FormField label="NIP Guru">
          <InputField value={nipGuru} onChange={(e) => setNipGuru(e.target.value)} />
        </FormField>
      </div>

      <SubmitButton loading={loading} />
    </form>
  );
};

interface FormGenericProps extends FormProps {
  docType: string;
}

const FormGeneric = ({ docType, onSubmit, loading }: FormGenericProps) => {
  const [namaSekolah, setNamaSekolah] = useState("");
  const [kelas, setKelas] = useState("");
  const [fase, setFase] = useState(FASE_OPTIONS[0]);
  const [mapel, setMapel] = useState("");
  const [topik, setTopik] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [catatan, setCatatan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ docType, namaSekolah, kelas, fase, mapel, topik, namaGuru, catatan });
  };

  return (
    <form onSubmit={handleSubmit} className="p-1">
      <SectionDivider title="Identitas Umum" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nama Sekolah">
          <InputField value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} />
        </FormField>
        <FormField label="Kelas">
          <InputField value={kelas} onChange={(e) => setKelas(e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fase">
          <SelectField options={FASE_OPTIONS} value={fase} onChange={setFase} />
        </FormField>
        <FormField label="Mata Pelajaran">
          <InputField value={mapel} onChange={(e) => setMapel(e.target.value)} />
        </FormField>
      </div>

      <SectionDivider title="Materi Pembelajaran" />
      <FormField label="Topik / Materi" required>
        <TextareaField value={topik} onChange={(e) => setTopik(e.target.value)} required />
      </FormField>

      <SectionDivider title="Data Guru & Catatan" />
      <FormField label="Nama Guru">
        <InputField value={namaGuru} onChange={(e) => setNamaGuru(e.target.value)} />
      </FormField>
      <FormField label="Catatan Tambahan">
        <TextareaField value={catatan} onChange={(e) => setCatatan(e.target.value)} />
      </FormField>

      <SubmitButton loading={loading} />
    </form>
  );
};


// --- MAIN DASHBOARD ---

export default function DashboardPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orientation, setOrientation] = useState("Portrait");

  const handleDocSelect = (doc: DocType) => {
    setSelectedDoc(doc);
    setResult(null);
    setErrorMsg(null);
  };

  const handleGenerate = async (payload: Record<string, any>) => {
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    if (payload.orientasi) {
      setOrientation(payload.orientasi);
    }
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error("Gagal generate dokumen");
      }
      const data = await res.json();
      setResult(data.result || "Dokumen berhasil di-generate.");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('document-content');
    if (!element) return;
    try {
      const html2pdf = (await import("html2pdf.js" as any)).default;
      const orient = orientation === 'Landscape' ? 'landscape' : 'portrait';
      const opt = {
        margin: 10,
        filename: `${selectedDoc?.replace(/ /g, '_') || 'dokumen'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orient }
      };
      html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("PDF generation error", e);
      alert("Gagal membuat PDF");
    }
  };

  const downloadDOCX = () => {
    const element = document.getElementById('document-content');
    if (!element) return;
    const orient = orientation === 'Landscape' ? 'landscape' : 'portrait';
    const pageSize = orient === 'landscape' 
      ? '@page { size: A4 landscape; margin: 2cm; }'
      : '@page { size: A4 portrait; margin: 2cm; }';
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><style>${pageSize} body { font-family: Arial, sans-serif; }</style></head>
      <body>${element.innerHTML}</body>
      </html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc?.replace(/ /g, '_') || 'dokumen'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderForm = () => {
    switch (selectedDoc) {
      case "Rincian Minggu Efektif": return <FormRincianMinggu onSubmit={handleGenerate} loading={loading} />;
      case "Analisis Capaian Pembelajaran": return <FormAnalisisCP onSubmit={handleGenerate} loading={loading} />;
      case "Rencana Pembelajaran Mendalam": return <FormRPM onSubmit={handleGenerate} loading={loading} />;
      default: return <FormGeneric docType={selectedDoc!} onSubmit={handleGenerate} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-bold text-xl text-slate-800">Ruang Kerja Guru</h1>
            {selectedDoc && <p className="text-sm text-slate-500">{selectedDoc}</p>}
          </div>
        </div>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
          Kurikulum Merdeka Mode
        </div>
      </header>

      <main className="flex-grow p-6">
        {!selectedDoc ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center justify-center mb-10 mt-10">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <BookOpen size={40} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Pilih Jenis Dokumen</h2>
              <p className="text-slate-500 mt-2">Pilih format dokumen administrasi yang ingin Anda buat</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DOCUMENT_TYPES.map(doc => (
                <button
                  key={doc.value}
                  onClick={() => handleDocSelect(doc.value)}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-start gap-4 group text-left"
                >
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">{doc.label}</h3>
                  </div>
                  <div className="w-full flex justify-end text-slate-300 group-hover:text-blue-500">
                    <ChevronRight size={20} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-140px)]">
            <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white flex justify-between items-center">
                <h2 className="font-semibold">{selectedDoc}</h2>
                <button onClick={() => setSelectedDoc(null)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[calc(100vh-180px)]">
                {renderForm()}
                {errorMsg && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm">{errorMsg}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {result ? (
                <>
                  <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Preview Dokumen</h3>
                    <div className="flex gap-2">
                      <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <FileDown size={16} /> Unduh PDF
                      </button>
                      <button onClick={downloadDOCX} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <FileDown size={16} /> Unduh DOCX
                      </button>
                    </div>
                  </div>
                  <div className="flex-grow p-8 overflow-y-auto bg-slate-100">
                    <div 
                      id="document-content" 
                      className="bg-white p-10 min-h-[1056px] w-full max-w-[816px] mx-auto shadow-md"
                      style={orientation === 'Landscape' ? { maxWidth: '1056px', minHeight: '816px' } : {}}
                      dangerouslySetInnerHTML={{ __html: result }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 m-4 rounded-xl text-slate-400">
                  {loading ? (
                    <>
                      <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                      <p className="text-slate-600 font-medium">Sedang memproses dokumen Anda...</p>
                      <p className="text-sm mt-2">Ini mungkin memakan waktu beberapa saat jika menggunakan AI.</p>
                    </>
                  ) : (
                    <>
                      <FileText size={64} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium text-slate-500">Preview Dokumen</p>
                      <p className="text-sm text-center max-w-sm mt-2">Isi form di sebelah kiri dan klik "Buat Dokumen" untuk melihat hasil di sini.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
