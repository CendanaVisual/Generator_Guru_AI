import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Model fallback chain ────────────────────────────────────────────────────
const MODEL_CHAIN = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

// ── HTML output rules injected into every prompt ────────────────────────────
const HTML_RULES = `
Aturan output wajib:
- Output HARUS berupa HTML langsung (TANPA backtick \`\`\`html atau apapun). Langsung mulai dari tag <div>.
- Gunakan inline CSS yang profesional. Warna utama heading: #1e3a8a. Font: Arial, sans-serif.
- Semua tabel wajib memiliki border 1px solid #cbd5e1, padding 8px, header background #1e3a8a teks putih.
- Konten harus lengkap, detail, dan berkualitas tinggi dalam bahasa Indonesia yang baik.
- Dokumen siap cetak format A4.
`.trim();

// ── Per-doctype prompt builder ──────────────────────────────────────────────
function buildPrompt(p: Record<string, any>): string {
  const { docType } = p;

  if (docType === "Rincian Minggu Efektif") {
    return `Buat dokumen "Rincian Minggu Efektif" Kurikulum Merdeka dengan data:
Nama Sekolah: ${p.namaSekolah} | Kelas: ${p.kelas} | Mapel: ${p.mapel}
JP/Minggu: ${p.jpMinggu} | Tahun Pelajaran: ${p.tahunPel || '2024/2025'} | Kota: ${p.tempat || ''}
Kepsek: ${p.namaKepsek || '-'} (NIP: ${p.nipKepsek || '-'}) | Guru: ${p.namaGuru || '-'} (NIP: ${p.nipGuru || '-'})
Catatan: ${p.catatan || '-'}

Dokumen mencakup:
1. Header sekolah yang rapi
2. Tabel rincian per bulan (Sem 1 & 2): No | Bulan | Jumlah Pekan | Tidak Efektif | Efektif | JP Efektif
3. Rekap total JP efektif per semester
4. Keterangan hari libur dan kegiatan sekolah
5. Kolom tanda tangan guru dan kepala sekolah
${HTML_RULES}`;
  }

  if (docType === "Analisis Capaian Pembelajaran") {
    const elemenStr = (p.elemen as any[] || [])
      .map((el: any, i: number) => `  Elemen ${i + 1} — "${el.nama}": ${el.deskripsi}`)
      .join('\n');
    return `Buat dokumen "Analisis Capaian Pembelajaran" Kurikulum Merdeka:
Mapel: ${p.mapel} | Jenjang: ${p.jenjang} | Kelas: ${p.kelas} | Fase: ${p.fase}
Pekan Efektif: ${p.pekanEfektif} | JP/Pekan: ${p.jpPerPekan} | Total JP: ${p.totalJp}
BAB Target: ${p.jumlahBab || 'menyesuaikan'} | Konteks: ${p.topik || '-'}
Format KKTP: ${p.kktp}
Kepsek: ${p.namaKepsek || '-'} (NIP: ${p.nipKepsek || '-'}) | Guru: ${p.namaGuru || '-'} (NIP: ${p.nipGuru || '-'}) | Kota: ${p.kota || '-'}

Elemen CP:
${elemenStr}

Dokumen mencakup:
1. Header identitas lengkap
2. Tabel Analisis CP: Elemen | Deskripsi CP | Tujuan Pembelajaran (TP) | Alokasi JP | ${p.kktp?.includes('Rubrik') ? 'Rubrik Asesmen (instrumen detail)' : 'KKTP (4 Rentang: Perlu Bimbingan/Cukup/Baik/Sangat Baik)'}
${p.protaProsem ? '3. PROTA (Program Tahunan) — tabel per semester menggunakan TP hasil analisis\n4. PROSEM (Program Semester 1 & 2) — tabel per bulan/minggu menggunakan TP\n' : ''}
5. Kolom tanda tangan
${HTML_RULES}`;
  }

  if (docType === "Rencana Pembelajaran Mendalam") {
    return `Buat "Modul Ajar / Rencana Pembelajaran Mendalam" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}

Struktur wajib:
A. Informasi Umum (identitas, alokasi waktu 3 pertemuan, sarana prasarana)
B. Komponen Inti (Profil Pelajar Pancasila, Pemahaman Bermakna, Pertanyaan Pemantik)
C. Kegiatan Pembelajaran per pertemuan (Pendahuluan 10 mnt, Inti 55 mnt, Penutup 10 mnt) — uraian detail
D. Asesmen: Diagnostik + Formatif + Sumatif lengkap dengan instrumen
E. Pengayaan & Remedial
F. Refleksi Guru & Peserta Didik
G. Lampiran: LKPD mini dan Rubrik Penilaian
${HTML_RULES}`;
  }

  if (docType === "RPP Cinta Kemenag") {
    return `Buat "RPP Cinta Kemenag" format Kementerian Agama RI:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}

Struktur format Kemenag:
A. Identitas (Madrasah/Sekolah Islam, Mapel, Kelas, Alokasi Waktu)
B. KI & KD (jika PAI/BTQ) atau Capaian Pembelajaran
C. Tujuan Pembelajaran (mengandung nilai-nilai Islami)
D. Materi Pembelajaran (termasuk dalil Al-Qur'an/Hadis bila relevan)
E. Metode (Islami, student-centered: diskusi, demonstrasi, ceramah interaktif)
F. Langkah Pembelajaran: Pendahuluan (salam, doa, apersepsi) — Inti — Penutup (doa, refleksi Islami)
G. Penilaian: Sikap Spiritual & Sosial | Pengetahuan | Keterampilan
H. Kolom tanda tangan
${HTML_RULES}`;
  }

  if (docType === "Rencana Pembelajaran Mendalam Kokulikuler") {
    return `Buat "Rencana Pembelajaran Kokulikuler / Modul Projek P5" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Kelas: ${p.kelas} | Fase: ${p.fase}
Tema Projek: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}

Struktur:
A. Identitas Projek (nama, tema, fase, alokasi waktu total)
B. Deskripsi Projek & Relevansi
C. Dimensi, Elemen & Sub-elemen Profil Pelajar Pancasila yang dikembangkan
D. Alur Projek (4 tahap): 1-Pengenalan | 2-Kontekstualisasi | 3-Aksi | 4-Refleksi & Tindak Lanjut
   (Setiap tahap: tujuan, aktivitas, durasi)
E. Tabel Jadwal Kegiatan (minggu per minggu)
F. Asesmen Projek: Rubrik per dimensi PPP
G. Sumber & Referensi
${HTML_RULES}`;
  }

  if (docType === "LKPD") {
    return `Buat "LKPD (Lembar Kerja Peserta Didik)" interaktif dan menarik:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Catatan: ${p.catatan || '-'}

Struktur:
A. Header LKPD (nama siswa, kelas, tanggal, nama LKPD yang menarik)
B. Tujuan Pembelajaran
C. Petunjuk Pengerjaan (jelas, ramah anak)
D. Kegiatan 1 — Mengamati/Membaca: stimulus + pertanyaan dengan area jawaban bergaris
E. Kegiatan 2 — Bereksperimen/Berdiskusi: langkah + tabel data/hasil
F. Kegiatan 3 — Menyimpulkan: isian paragraph/esai singkat
G. Tantangan Ekstra (opsional, untuk pengayaan)
H. Refleksi Diri (emoji rating + pertanyaan refleksi)
Buat desain yang menarik dan ramah untuk anak sekolah dengan penggunaan emoji yang tepat.
${HTML_RULES}`;
  }

  if (docType === "Asesmen Lengkap") {
    return `Buat perangkat "Asesmen Lengkap" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}

Harus mencakup semua komponen berikut:
1. ASESMEN DIAGNOSTIK — 5 pertanyaan awal (pilihan ganda + isian) + kunci
2. ASESMEN FORMATIF — 5 PG + 3 uraian singkat + rubrik penilaian per soal
3. ASESMEN SUMATIF — 10 PG (dengan 4 opsi ABCD) + 5 uraian + kunci jawaban + pedoman penskoran
4. RUBRIK PENILAIAN SIKAP (tabel observasi: dimensi PPP)
5. RUBRIK PENILAIAN KETERAMPILAN / UNJUK KERJA (tabel per indikator)
6. LEMBAR REKAP NILAI (tabel siap isi: nama siswa, skor diagnostik, formatif, sumatif, ket)
${HTML_RULES}`;
  }

  if (docType === "Jurnal Harian") {
    return `Buat "Jurnal Harian Guru" Kurikulum Merdeka:
Sekolah: ${p.namaSekolah || '-'} | Mapel: ${p.mapel} | Kelas: ${p.kelas} | Fase: ${p.fase}
Topik/Materi Hari Ini: ${p.topik} | Guru: ${p.namaGuru || '-'} | Catatan: ${p.catatan || '-'}

Struktur:
A. Identitas (hari/tanggal, kelas, mapel, jumlah siswa hadir)
B. Tujuan Pembelajaran hari ini
C. Capaian Pembelajaran yang dituju
D. Deskripsi Kegiatan: Pendahuluan | Inti (detail per fase) | Penutup
E. Catatan Perkembangan Peserta Didik (tabel: nama, catatan, rekomendasi)
F. Refleksi Guru: Hal yang berhasil | Tantangan | Tindak Lanjut
G. Tanda tangan guru
${HTML_RULES}`;
  }

  return `Buat dokumen "${docType}" yang lengkap untuk kelas ${p.kelas || ''} tentang "${p.topik || ''}" sesuai Kurikulum Merdeka.\n${HTML_RULES}`;
}

// ── Fallback template (jika API Key tidak ada/invalid) ──────────────────────
function generateFallbackHTML(docType: string, payload: Record<string, any>): string {
  const topic = payload.topik || payload.topic || '(Topik belum diisi)';
  const grade = payload.kelas || payload.grade || '';
  const mapel = payload.mapel || '';
  const namaSekolah = payload.namaSekolah || '[Nama Sekolah]';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #1e3a8a; margin-bottom: 5px;">${docType.toUpperCase()}</h1>
        <p style="color: #64748b; margin: 0;">${namaSekolah} — Kurikulum Merdeka</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        ${mapel ? `<tr><td style="border:1px solid #cbd5e1;padding:8px;background:#f1f5f9;width:200px"><strong>Mata Pelajaran</strong></td><td style="border:1px solid #cbd5e1;padding:8px">${mapel}</td></tr>` : ''}
        ${grade ? `<tr><td style="border:1px solid #cbd5e1;padding:8px;background:#f1f5f9"><strong>Kelas</strong></td><td style="border:1px solid #cbd5e1;padding:8px">${grade}</td></tr>` : ''}
        <tr><td style="border:1px solid #cbd5e1;padding:8px;background:#f1f5f9"><strong>Topik</strong></td><td style="border:1px solid #cbd5e1;padding:8px">${topic}</td></tr>
      </table>
      <div style="background:#fef9c3;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-top:24px">
        <strong>⚠️ Mode Template:</strong> Dokumen ini dihasilkan dari template karena API Key Gemini belum dikonfigurasi atau tidak valid.<br>
        Masukkan <code>GEMINI_API_KEY</code> yang valid di <em>Vercel → Settings → Environment Variables</em> lalu <em>Redeploy</em> untuk mendapatkan konten AI yang dinamis dan penuh.
      </div>
    </div>
  `;
}

// ── Main handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { docType } = payload;

    if (!docType) {
      return NextResponse.json({ error: 'Jenis dokumen belum dipilih.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({ content: generateFallbackHTML(docType, payload) });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const userPrompt = buildPrompt(payload);
    const systemInstruction = `Anda adalah asisten ahli pendidikan Indonesia. Output selalu dalam HTML langsung tanpa backtick atau markdown. Font wajib Arial/sans-serif.`;

    let lastError = '';
    for (const modelName of MODEL_CHAIN) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
        const result = await model.generateContent(userPrompt);
        let aiContent = result.response.text();
        aiContent = aiContent.replace(/```html\s*/gi, '').replace(/```\s*/gi, '');
        return NextResponse.json({ content: aiContent });
      } catch (modelError: any) {
        lastError = modelError.message || 'Unknown error';
        console.warn(`Model ${modelName} gagal: ${lastError}`);
        continue;
      }
    }

    // Semua model gagal — fallback ke template
    console.error('Semua model gagal. Last error:', lastError);
    return NextResponse.json({ content: generateFallbackHTML(docType, payload) });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
