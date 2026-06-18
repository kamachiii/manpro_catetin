import React from "react";
import { HelpCircle, ShieldCheck, Coins, FileText, CheckCircle2 } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
      question: "Apa itu Catetin?",
      answer:
        "Catetin adalah platform akademis berbasis koin yang dirancang bagi mahasiswa untuk saling membagikan dan mengunduh catatan kuliah, ringkasan materi, latihan soal, dan persiapan ujian secara aman dan terstruktur.",
    },
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      question: "Apa saja jenis file yang didukung untuk diunggah?",
      answer:
        "Untuk saat ini (tahap MVP), platform kami hanya mendukung berkas dokumen berupa file PDF dengan batas ukuran maksimal sebesar 20 MB per file untuk memastikan keamanan dan kemudahan pratinjau berkas.",
    },
    {
      icon: <Coins className="h-5 w-5 text-primary" />,
      question: "Bagaimana cara mendapatkan Koin?",
      answer:
        "Anda dapat memperoleh koin dengan mengunggah berkas catatan kuliah buatan Anda sendiri. Setiap kali catatan Anda lolos verifikasi dan disetujui oleh Administrator, akun Anda akan secara otomatis menerima reward sebesar +5 koin.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      question: "Bagaimana cara kerja verifikasi catatan kuliah?",
      answer:
        "Setelah Anda mengunggah catatan, status dokumen akan menjadi 'Pending'. Tim Administrator akan memeriksa kualitas konten akademis dan kesesuaian dokumen. Catatan yang disetujui ('Approved') akan muncul di halaman publik dan menghasilkan reward koin untuk Anda. Catatan yang ditolak ('Rejected') akan disertai alasan penolakan.",
    },
    {
      icon: <Coins className="h-5 w-5 text-primary" />,
      question: "Bagaimana cara melakukan Top Up koin secara manual?",
      answer:
        "Anda dapat mengajukan pengisian koin secara manual melalui menu Top Up di Dashboard Anda. Pilih nominal paket koin, lakukan pembayaran melalui rekening bank, QRIS, atau e-wallet yang tersedia, lalu unggah bukti transfer. Koin akan bertambah setelah diverifikasi admin.",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      question: "Apakah koin saya berkurang jika mengunduh ulang catatan yang sama?",
      answer:
        "Tidak. Sistem kami mencatat seluruh riwayat unduhan Anda. Sekali Anda telah mengunduh catatan kuliah tertentu, Anda dapat mengunduh kembali catatan tersebut di masa mendatang tanpa dipotong koin lagi.",
    },
  ];

  return (
    <div className="bg-background text-foreground font-sans min-h-screen py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Pusat Bantuan & FAQ
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            Temukan jawaban atas pertanyaan umum mengenai koin, verifikasi catatan, dan cara penggunaan platform.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex gap-4 items-start"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {faq.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
