import Link from "next/link";
import { ArrowLeft, Heart, Lock } from "lucide-react";

export const metadata = {
  title: "Privasi — Yugma",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Lock className="h-5 w-5" />
        </span>
        <h1 className="font-serif text-3xl tracking-tight">Privasi & Keamanan</h1>
      </div>

      <div className="prose prose-stone max-w-none space-y-6 text-foreground/80">
        <p className="text-lg italic text-muted-foreground">
          Privasi bukan fitur tambahan — itu pondasi Yugma.
        </p>

        <section>
          <h2 className="font-serif text-xl">Data kamu, hanya milik kamu berdua</h2>
          <p>
            Seluruh data — foto, surat, cerita, dan rencana kalian — disimpan dengan Row Level
            Security di level database. Artinya, bahkan jika seseorang berhasil mengakses database,
            mereka tetap tidak akan bisa membaca data kalian tanpa akses sebagai anggota couple.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl">Apa yang kami simpan</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Data profil (nama, email, foto profil)</li>
            <li>Konten couple (memories, letters, mood, dst.)</li>
            <li>File foto di Supabase Storage (bucket privat)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl">Yang TIDAK kami lakukan</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Tidak ada iklan</li>
            <li>Tidak ada pelacakan perilaku untuk iklan</li>
            <li>Tidak membagikan data ke pihak ketiga</li>
            <li>Tidak ada publikasi default — semuanya privat by default</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl">Hak kamu</h2>
          <p>
            Kamu bisa export seluruh data kamu sewaktu-waktu, atau menghapus akun dan seluruh
            data couple kalian. Jika salah satu partner menghapus akun, data tetap menjadi milik
            pasangan yang tersisa.
          </p>
        </section>
      </div>

      <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Heart className="h-3.5 w-3.5 text-primary" fill="currentColor" />
        <span>Made with care for two</span>
      </div>
    </div>
  );
}