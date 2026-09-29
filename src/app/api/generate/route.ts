import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { marked } from 'marked'; // We need marked to convert markdown to HTML for PDF generation. Wait, let's just ask AI to output HTML!

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy',
});

export async function POST(req: Request) {
  try {
    const { topic, grade, docType } = await req.json();

    if (!topic || !grade || !docType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy') {
      // MOCK RESPONSE for Local Testing if no API Key provided
      return NextResponse.json({ 
        content: `
          <div style="font-family: sans-serif;">
            <h1 style="text-align: center; color: #1e3a8a;">${docType} (Demo)</h1>
            <h3 style="text-align: center; color: #64748b;">Fase: ${grade} | Kurikulum Merdeka</h3>
            <hr style="margin: 20px 0;" />
            <h2>Informasi Umum</h2>
            <ul>
              <li><strong>Topik:</strong> ${topic}</li>
              <li><strong>Alokasi Waktu:</strong> 2 x 35 Menit</li>
            </ul>
            <h2>Capaian Pembelajaran (Contoh)</h2>
            <p>Peserta didik dapat mengidentifikasi ${topic} dan memahaminya dalam kehidupan sehari-hari.</p>
            <div style="background-color: #fef08a; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <strong>⚠️ Perhatian:</strong> Ini adalah format demo karena OPENAI_API_KEY belum diisi di file .env. <br>
              Silakan masukkan API Key Anda untuk mendapatkan hasil AI yang sesungguhnya.
            </div>
          </div>
        `
      });
    }

    const systemPrompt = `
      Anda adalah asisten ahli pendidikan di Indonesia yang sangat menguasai Kurikulum Merdeka.
      Tugas Anda adalah membuat ${docType} untuk murid pada ${grade}.
      Topik pembelajaran adalah: ${topic}.
      
      Aturan output:
      - Harus sesuai struktur Kurikulum Merdeka (Informasi Umum, Komponen Inti, Capaian Pembelajaran, Profil Pelajar Pancasila, dll).
      - Hasil HARUS berupa format HTML langsung (tanpa markdown blok \`\`\`html) agar siap dirender.
      - Gunakan tag semantik HTML (<h1>, <h2>, <ul>, <ol>, <p>, <table> jika perlu) dengan inline styling minimalis dan profesional agar bagus saat di-convert ke PDF.
      - Pastikan font-family Arial/sans-serif.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.7,
    });

    const aiContent = response.choices[0].message?.content || '<p>Gagal menghasilkan konten.</p>';

    return NextResponse.json({ content: aiContent.replace(/\`\`\`html|\`\`\`/g, '') });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
