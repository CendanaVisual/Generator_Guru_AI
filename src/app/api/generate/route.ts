import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Menggunakan API Key dari Environment Variable
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { topic, grade, docType } = await req.json();

    if (!topic || !grade || !docType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
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

    // Menggunakan model Gemini 1.5 Flash (standar AI Studio)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(`Tolong buatkan dokumen ${docType} tentang materi ${topic} untuk fase/kelas ${grade} sesuai Kurikulum Merdeka.`);
    const aiContent = result.response.text();

    return NextResponse.json({ content: aiContent.replace(/\`\`\`html|\`\`\`/g, '') });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
