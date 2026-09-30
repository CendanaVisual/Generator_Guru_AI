import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_CHAIN = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
  return new GoogleGenerativeAI(apiKey);
}

async function callGemini(prompt: string): Promise<string | null> {
  const genAI = getGenAI();
  if (!genAI) return null;

  const systemInstruction = 'Anda adalah asisten ahli pendidikan Indonesia. Output selalu dalam HTML langsung tanpa backtick atau markdown. Font wajib Arial/sans-serif.';

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const result = await model.generateContent(prompt);
      let content = result.response.text();
      content = content.replace(/```html\s*/gi, '').replace(/```\s*/gi, '');
      return content;
    } catch (err: any) {
      console.warn(`Model ${modelName} gagal: ${err.message}`);
      continue;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Sub-action: generate detail materi from tujuan pembelajaran
    if (payload._action === 'generate-materi') {
      const prompt = `Anda ahli kurikulum Indonesia. Berdasarkan tujuan pembelajaran berikut:
"${payload.tujuanPembelajaran}"

Buatkan detail materi pembelajaran yang mencakup:
- Konsep kunci dan sub-topik
- Uraian materi per pertemuan (${payload.jumlahPertemuan || 1} pertemuan)
- Fakta, konsep, prinsip, dan prosedur yang harus dikuasai peserta didik

Output dalam teks biasa (bukan HTML), rapi dan terstruktur.`;

      const genAI = getGenAI();
      if (!genAI) return NextResponse.json({ text: 'API Key belum dikonfigurasi. Silakan isi detail materi secara manual.' });

      for (const modelName of MODEL_CHAIN) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          return NextResponse.json({ text: result.response.text() });
        } catch { continue; }
      }
      return NextResponse.json({ text: 'AI sedang sibuk. Silakan isi manual.' });
    }

    // Main document generation
    const { docType } = payload;
    if (!docType) return NextResponse.json({ error: 'Jenis dokumen belum dipilih.' }, { status: 400 });

    const prompt = buildPrompt(payload);
    const aiContent = await callGemini(prompt);

    if (aiContent) {
      return NextResponse.json({ content: aiContent });
    }

    return NextResponse.json({ content: generateFallback(payload) });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER — setiap docType memiliki prompt khusus
// ═══════════════════════════════════════════════════════════════════════════
const HTML_RULES = `
ATURAN OUTPUT WAJIB:
- Output HARUS HTML langsung (TANPA backtick). Langsung mulai dari <div>.
- Inline CSS profesional. Heading utama: #1e3a8a. Font: Arial, sans-serif.
- Tabel: border 1px solid #cbd5e1, padding 8px, header background #1e3a8a teks putih.
- Konten lengkap, detail, berkualitas tinggi, bahasa Indonesia baku.
- Dokumen siap cetak A4.`.trim();

function buildPrompt(p: Record<string, any>): string {
  const dt = p.docType;

  if (dt === 'Rincian Minggu Efektif') {
    return `Buat "Rincian Minggu Efektif" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah} | Kelas: ${p.kelas} | Mapel: ${p.mapel}
JP/Minggu: ${p.jpMinggu} | TP: ${p.tahunPel || '2024/2025'} | Kota: ${p.tempat || ''}
Kepsek: ${p.namaKepsek || '-'} NIP: ${p.nipKepsek || '-'} | Guru: ${p.namaGuru || '-'} NIP: ${p.nipGuru || '-'}
Catatan: ${p.catatan || '-'}
Isi: Header, tabel rincian per bulan (Sem1&2) kolom: No|Bulan|Jml Pekan|Tidak Efektif|Efektif|JP Efektif, rekap total, kolom TTD.
${HTML_RULES}`;
  }

  if (dt === 'Analisis Capaian Pembelajaran') {
    const el = (p.elemen as any[] || []).map((e: any, i: number) => `  Elemen ${i+1}: "${e.nama}" — ${e.deskripsi}`).join('\n');
    return `Buat "Analisis CP" Kurikulum Merdeka:
Mapel: ${p.mapel} | Jenjang: ${p.jenjang} | Kelas: ${p.kelas} | Fase: ${p.fase}
Pekan Efektif: ${p.pekanEfektif} | JP/Pekan: ${p.jpPerPekan} | Total JP: ${p.totalJp}
BAB: ${p.jumlahBab || 'sesuaikan'} | Konteks: ${p.topik || '-'} | KKTP: ${p.kktp}
${p.protaProsem ? 'SERTAKAN PROTA & PROSEM dalam 1 file terpadu.' : ''}
Kepsek: ${p.namaKepsek || '-'} NIP: ${p.nipKepsek || '-'} | Guru: ${p.namaGuru || '-'} NIP: ${p.nipGuru || '-'} | Kota: ${p.kota || '-'}
Elemen CP:\n${el}
Isi: Header, Tabel Analisis CP (Elemen|Deskripsi|TP|Alokasi JP|KKTP), ${p.protaProsem ? 'PROTA, PROSEM,' : ''} kolom TTD.
${HTML_RULES}`;
  }

  if (dt === 'Rencana Pembelajaran Mendalam') {
    const dpl = (p.dimensiProfil as string[] || []).join(', ');
    return `Buat "Modul Ajar / Rencana Pembelajaran Mendalam" Kurikulum Merdeka.
== DATA UMUM ==
Mapel: ${p.mapel} | Jenjang: ${p.jenjang} | Kelas: ${p.kelas} | Fase: ${p.fase}
Semester: ${p.semester} | TP: ${p.tahunPelajaran || '2024/2025'}
Alokasi Waktu: ${p.alokasiWaktu} | Jumlah Pertemuan: ${p.jumlahPertemuan}

== DESAIN PEMBELAJARAN ==
Model: ${p.modelPembelajaran} | Pendekatan: ${p.pendekatanKhusus || 'Standar'}
Topik Utama: ${p.topikUtama}
Tujuan Pembelajaran: ${p.tujuanPembelajaran}
Detail Materi: ${p.detailMateri || '(buatkan berdasarkan tujuan pembelajaran)'}
Gaya Bahasa: ${p.gayaBahasa}
Gaya Penyusunan: ${p.gayaPenyusunan}

${p.gayaPenyusunan?.includes('Tabel') ? 'INSTRUKSI GAYA: Sajikan seluruh komponen A–F dalam TABEL/matriks dua kolom (Komponen | Uraian). Rapi, seragam, mudah diperiksa pengawas. Lampiran rubrik juga dalam tabel.' : 'INSTRUKSI GAYA: Sajikan dengan nomor Romawi I–VI, uraian paragraf dan daftar naratif klasik.'}

== DIMENSI PROFIL PELAJAR PANCASILA ==
${dpl}

== DATA PENGESAHAN ==
Kepsek: ${p.namaKepsek || '-'} NIP: ${p.nipKepsek || '-'} | Guru: ${p.namaGuru || '-'} NIP: ${p.nipGuru || '-'} | Kota: ${p.kota || '-'}

== ORIENTASI: ${p.orientasi || 'Portrait'} ==

STRUKTUR WAJIB:
A. Informasi Umum (identitas lengkap, alokasi waktu, sarana, target peserta didik)
B. Komponen Inti (Pemahaman Bermakna, Pertanyaan Pemantik, Dimensi PPP yang dipilih)
C. Kegiatan Pembelajaran — DETAIL PER PERTEMUAN (${p.jumlahPertemuan} pertemuan) masing-masing: Pendahuluan–Inti–Penutup dengan durasi, langkah, metode, dan media.
D. Asesmen (Diagnostik + Formatif + Sumatif lengkap dengan instrumen & rubrik)
E. Pengayaan & Remedial
F. Refleksi Guru & Peserta Didik
G. Lampiran: LKPD mini, Rubrik Penilaian, Bahan Ajar
H. Kolom tanda tangan (Guru & Kepala Sekolah)
${HTML_RULES}`;
  }

  if (dt === 'RPP Cinta Kemenag') {
    return `Buat "RPP Cinta Kemenag" format Kemenag RI:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}
Struktur Kemenag: Identitas, KI&KD/CP, Tujuan, Materi (dalil jika relevan), Metode Islami, Langkah (salam+doa–Inti–Penutup+doa), Penilaian (Sikap-Pengetahuan-Keterampilan), TTD.
${HTML_RULES}`;
  }

  if (dt === 'Rencana Pembelajaran Mendalam Kokulikuler') {
    return `Buat "Modul Projek P5 / RPM Kokulikuler" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Kelas: ${p.kelas} | Fase: ${p.fase}
Tema: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}
Struktur: Identitas, Deskripsi, Dimensi PPP, Alur 4 Tahap (Pengenalan–Kontekstualisasi–Aksi–Refleksi), Jadwal minggu/minggu, Asesmen rubrik PPP, Refleksi.
${HTML_RULES}`;
  }

  if (dt === 'LKPD') {
    return `Buat "LKPD" interaktif Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Catatan: ${p.catatan || '-'}
Struktur: Header (nama/kelas/tgl), Tujuan, Petunjuk, Kegiatan 1 (Mengamati), Kegiatan 2 (Diskusi), Kegiatan 3 (Simpulan), Tantangan Ekstra, Refleksi Diri. Area jawaban bergaris.
${HTML_RULES}`;
  }

  if (dt === 'Asesmen Lengkap') {
    return `Buat "Asesmen Lengkap" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}
Isi: 1.Diagnostik (5 soal+kunci) 2.Formatif (5PG+3uraian+rubrik) 3.Sumatif (10PG+5uraian+kunci+skor) 4.Rubrik Sikap 5.Rubrik Keterampilan 6.Rekap Nilai (tabel).
${HTML_RULES}`;
  }

  if (dt === 'Jurnal Harian') {
    return `Buat "Jurnal Harian Guru" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}
Isi: Identitas, Tujuan hari ini, CP dituju, Kegiatan (Pendahuluan-Inti-Penutup), Perkembangan Siswa (tabel), Refleksi (berhasil/tantangan/tindak lanjut), TTD.
${HTML_RULES}`;
  }

  return `Buat dokumen "${dt}" lengkap. ${JSON.stringify(p)}\n${HTML_RULES}`;
}

function generateFallback(p: Record<string, any>): string {
  return `<div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto">
    <h1 style="color:#1e3a8a;text-align:center">${p.docType}</h1>
    <p style="text-align:center;color:#64748b">Kurikulum Merdeka</p>
    <div style="background:#fef9c3;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:24px 0">
      <strong>⚠️ Mode Template:</strong> API Key Gemini belum dikonfigurasi atau tidak valid.
      Masukkan <code>GEMINI_API_KEY</code> di Vercel → Settings → Environment Variables lalu Redeploy.
    </div></div>`;
}
