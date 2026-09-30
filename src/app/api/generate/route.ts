import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Daftar model yang akan dicoba secara berurutan (fallback chain)
const MODEL_CHAIN = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

function generateDemoHTML(docType: string, grade: string, topic: string): string {
  const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  if (docType === "Modul Ajar" || docType === "RPP") {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #1e3a8a; margin-bottom: 5px;">${docType.toUpperCase()}</h1>
          <h2 style="color: #475569; font-weight: normal;">Kurikulum Merdeka</h2>
        </div>
        
        <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">A. Informasi Umum</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9; width: 200px;"><strong>Satuan Pendidikan</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">[Nama Sekolah]</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Fase / Kelas</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">${grade}</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Mata Pelajaran</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">[Sesuaikan]</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Topik</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">${topic}</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Alokasi Waktu</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">2 x 35 Menit</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Tanggal</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">${now}</td></tr>
        </table>

        <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">B. Capaian Pembelajaran</h2>
        <p>Peserta didik mampu mengidentifikasi, memahami, dan menjelaskan konsep <strong>${topic}</strong> serta mengaitkannya dalam konteks kehidupan sehari-hari sesuai tahapan perkembangan pada ${grade}.</p>

        <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">C. Tujuan Pembelajaran</h2>
        <ol>
          <li>Peserta didik dapat menjelaskan pengertian ${topic} dengan bahasa sendiri.</li>
          <li>Peserta didik dapat mengidentifikasi contoh-contoh ${topic} di lingkungan sekitar.</li>
          <li>Peserta didik dapat mempraktikkan pengetahuan tentang ${topic} dalam aktivitas sederhana.</li>
        </ol>

        <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">D. Profil Pelajar Pancasila</h2>
        <ul>
          <li><strong>Bernalar Kritis</strong> — Menganalisis dan mengevaluasi informasi terkait ${topic}.</li>
          <li><strong>Gotong Royong</strong> — Bekerja sama dalam kelompok untuk menyelesaikan tugas.</li>
          <li><strong>Kreatif</strong> — Menemukan cara-cara baru untuk mengekspresikan pemahaman.</li>
        </ul>

        <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">E. Kegiatan Pembelajaran</h2>
        <h3>1. Pendahuluan (10 menit)</h3>
        <ul>
          <li>Guru menyapa peserta didik dan melakukan presensi.</li>
          <li>Guru menyampaikan tujuan pembelajaran hari ini.</li>
          <li>Ice breaking atau apersepsi terkait ${topic}.</li>
        </ul>
        <h3>2. Kegiatan Inti (45 menit)</h3>
        <ul>
          <li>Guru menyajikan materi tentang ${topic} melalui media visual.</li>
          <li>Peserta didik berdiskusi dalam kelompok kecil.</li>
          <li>Peserta didik mempresentasikan hasil diskusi.</li>
          <li>Guru memberikan penguatan dan klarifikasi.</li>
        </ul>
        <h3>3. Penutup (15 menit)</h3>
        <ul>
          <li>Guru bersama peserta didik menyimpulkan materi.</li>
          <li>Refleksi: Apa yang sudah dipelajari hari ini?</li>
          <li>Guru memberikan tindak lanjut/tugas rumah.</li>
        </ul>

        <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">F. Asesmen</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #1e3a8a; color: white;"><th style="border: 1px solid #cbd5e1; padding: 8px;">Jenis</th><th style="border: 1px solid #cbd5e1; padding: 8px;">Teknik</th><th style="border: 1px solid #cbd5e1; padding: 8px;">Instrumen</th></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Diagnostik</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Tanya jawab</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Pertanyaan lisan</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Formatif</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Observasi & LKPD</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Lembar observasi</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Sumatif</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Tes tertulis</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Soal uraian</td></tr>
        </table>

        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2563eb;">
          <strong>ℹ️ Mode Template:</strong> Dokumen ini dibuat menggunakan template bawaan karena API Key Gemini belum dikonfigurasi dengan benar. 
          Silakan masukkan API Key yang valid di <em>Vercel → Settings → Environment Variables</em> untuk mendapatkan konten yang di-generate oleh AI secara dinamis.
        </div>
      </div>
    `;
  }

  if (docType === "LKPD") {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; border: 3px solid #1e3a8a; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
          <h1 style="color: #1e3a8a; margin-bottom: 5px;">LEMBAR KERJA PESERTA DIDIK (LKPD)</h1>
          <p style="color: #475569;">${grade} — Kurikulum Merdeka</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9; width: 150px;"><strong>Nama</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">................................</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Kelas</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">................................</td></tr>
          <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Tanggal</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">................................</td></tr>
        </table>

        <h2 style="color: #1e3a8a;">Topik: ${topic}</h2>
        
        <h3>🎯 Tujuan</h3>
        <p>Setelah mengerjakan LKPD ini, peserta didik diharapkan dapat memahami dan menjelaskan konsep ${topic}.</p>

        <h3>📝 Kegiatan 1: Mengamati</h3>
        <p>Amatilah gambar/objek yang berkaitan dengan <strong>${topic}</strong>, lalu jawab pertanyaan berikut:</p>
        <ol>
          <li>Apa yang kamu amati? <br><div style="border-bottom: 1px solid #94a3b8; margin: 10px 0; height: 30px;"></div></li>
          <li>Sebutkan 3 hal yang kamu ketahui tentang ${topic}! <br><div style="border-bottom: 1px solid #94a3b8; margin: 10px 0; height: 30px;"></div><div style="border-bottom: 1px solid #94a3b8; margin: 10px 0; height: 30px;"></div><div style="border-bottom: 1px solid #94a3b8; margin: 10px 0; height: 30px;"></div></li>
        </ol>

        <h3>📝 Kegiatan 2: Berdiskusi</h3>
        <p>Diskusikan bersama kelompokmu dan tuliskan kesimpulannya:</p>
        <div style="border: 1px solid #94a3b8; border-radius: 8px; padding: 15px; min-height: 80px; margin-bottom: 15px;"></div>

        <h3>⭐ Refleksi</h3>
        <p>Apa yang paling menarik dari materi ${topic} hari ini?</p>
        <div style="border: 1px solid #94a3b8; border-radius: 8px; padding: 15px; min-height: 60px;"></div>

        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2563eb;">
          <strong>ℹ️ Mode Template:</strong> Dokumen ini dibuat menggunakan template bawaan. Konfigurasi API Key Gemini yang valid untuk konten AI dinamis.
        </div>
      </div>
    `;
  }

  // Jurnal Harian
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #1e3a8a;">JURNAL HARIAN GURU</h1>
        <p style="color: #475569;">Kurikulum Merdeka</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9; width: 200px;"><strong>Hari/Tanggal</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">${now}</td></tr>
        <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Kelas</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">${grade}</td></tr>
        <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Materi</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">${topic}</td></tr>
        <tr><td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Jumlah Siswa Hadir</strong></td><td style="border: 1px solid #cbd5e1; padding: 8px;">... dari ... siswa</td></tr>
      </table>

      <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">Deskripsi Kegiatan</h2>
      <p>Pembelajaran dimulai dengan apersepsi terkait <strong>${topic}</strong>. Peserta didik antusias mengikuti kegiatan diskusi dan presentasi kelompok. Materi disampaikan menggunakan media visual dan diselingi tanya jawab.</p>

      <h2 style="color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 10px;">Refleksi Guru</h2>
      <ul>
        <li><strong>Hal yang berhasil:</strong> Peserta didik aktif berpartisipasi dalam diskusi kelompok.</li>
        <li><strong>Tantangan:</strong> Beberapa peserta didik masih perlu bimbingan lebih lanjut.</li>
        <li><strong>Tindak Lanjut:</strong> Memberikan tugas tambahan dan pendampingan individual.</li>
      </ul>

      <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2563eb;">
        <strong>ℹ️ Mode Template:</strong> Dokumen ini dibuat menggunakan template bawaan. Konfigurasi API Key Gemini yang valid untuk konten AI dinamis.
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const { topic, grade, docType } = await req.json();

    if (!topic || !grade || !docType) {
      return NextResponse.json({ error: 'Parameter belum lengkap. Pastikan semua field terisi.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Jika tidak ada API Key, langsung gunakan template
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({ content: generateDemoHTML(docType, grade, topic) });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = `
Anda adalah asisten ahli pendidikan di Indonesia yang sangat menguasai Kurikulum Merdeka.
Tugas Anda adalah membuat ${docType} untuk murid pada ${grade}.
Topik pembelajaran adalah: ${topic}.

Aturan output:
- Harus sesuai struktur Kurikulum Merdeka (Informasi Umum, Komponen Inti, Capaian Pembelajaran, Profil Pelajar Pancasila, dll).
- Hasil HARUS berupa format HTML langsung (TANPA markdown code fences \`\`\`html). Langsung mulai dari tag <div>.
- Gunakan tag semantik HTML (<h1>, <h2>, <ul>, <ol>, <p>, <table> jika perlu) dengan inline styling minimalis dan profesional agar bagus saat di-convert ke PDF.
- Pastikan font-family: Arial, sans-serif.
- Buat konten yang detail, lengkap, dan berkualitas tinggi.
- Gunakan bahasa Indonesia yang baik dan benar.
    `.trim();

    // Coba setiap model secara berurutan sampai ada yang berhasil
    let lastError = '';
    for (const modelName of MODEL_CHAIN) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt
        });

        const result = await model.generateContent(
          `Tolong buatkan dokumen ${docType} yang lengkap dan detail tentang materi "${topic}" untuk ${grade} sesuai Kurikulum Merdeka.`
        );
        
        let aiContent = result.response.text();
        // Bersihkan markdown code fences jika ada
        aiContent = aiContent.replace(/```html\s*/gi, '').replace(/```\s*/gi, '');

        return NextResponse.json({ content: aiContent });
      } catch (modelError: any) {
        lastError = modelError.message || 'Unknown error';
        console.warn(`Model ${modelName} gagal: ${lastError}`);
        continue; // Coba model berikutnya
      }
    }

    // Jika SEMUA model gagal, cek apakah karena API Key invalid
    if (lastError.includes('API key not valid') || lastError.includes('API_KEY_INVALID')) {
      console.error('API Key tidak valid, menggunakan template fallback.');
      return NextResponse.json({ content: generateDemoHTML(docType, grade, topic) });
    }

    // Fallback terakhir: gunakan template
    console.error('Semua model gagal, menggunakan template fallback. Last error:', lastError);
    return NextResponse.json({ content: generateDemoHTML(docType, grade, topic) });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
