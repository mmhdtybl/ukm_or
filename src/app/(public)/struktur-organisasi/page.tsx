import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { FiUser } from "react-icons/fi";

export const metadata = { title: "Struktur Organisasi" };
export const dynamic = "force-dynamic";

type Person = { id: string; nama: string; jabatan: string; divisi?: string | null; foto?: string | null };

function KartuOrang({ person }: { person: Person }) {
  return <article className="card text-center">
    <div className="relative mx-auto mb-4 grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-surface-light dark:bg-white/10">
      {person.foto ? <Image src={person.foto} alt={`Foto ${person.nama}`} fill sizes="96px" className="object-cover" /> : <FiUser size={32} className="text-slate-400" />}
    </div>
    <h3 className="font-semibold">{person.nama}</h3>
    <p className="text-xs font-semibold text-accent">{person.jabatan}</p>
  </article>;
}

function Seksi({ title, people }: { title: string; people: Person[] }) {
  if (!people.length) return null;
  return <section>
    <h2 className="mb-5 border-l-4 border-accent pl-3 text-lg font-semibold text-primary dark:text-accent">{title}</h2>
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{people.map((person) => <KartuOrang key={person.id} person={person} />)}</div>
  </section>;
}

export default async function StrukturPage() {
  const [dataPengurus, dataAnggota] = await Promise.all([
    prisma.pengurus.findMany({ where: { isActive: true }, include: { user: { select: { avatar: true, role: true } } }, orderBy: [{ urutan: "asc" }, { nama: "asc" }] }),
    prisma.anggota.findMany({ include: { user: { select: { avatar: true, role: true } } }, orderBy: [{ divisi: "asc" }, { nama: "asc" }] }),
  ]);

  // Foto avatar akun selalu diprioritaskan agar perubahan profil langsung tampil.
  // Admin disaring dari seluruh struktur publik.
  const pengurus = dataPengurus.filter((p) => p.user?.role !== "ADMIN");
  const userPengurus = new Set(pengurus.flatMap((p) => p.userId ? [p.userId] : []));
  const anggota = dataAnggota.filter((a) => a.user?.role !== "ADMIN" && (!a.userId || !userPengurus.has(a.userId)));
  const personPengurus = (list: typeof pengurus): Person[] => list.map((p) => ({ id: `pengurus-${p.id}`, nama: p.nama, jabatan: p.jabatan, divisi: p.divisi, foto: p.user?.avatar || p.foto }));
  const personAnggota = (list: typeof anggota): Person[] => list.map((a) => ({ id: `anggota-${a.id}`, nama: a.nama, jabatan: "Anggota", divisi: a.divisi, foto: a.user?.avatar || a.foto }));

  const dpo = pengurus.filter((p) => p.kodeJabatan === "DPO");
  const inti = pengurus.filter((p) => ["KETUA_UMUM", "WAKIL_KETUA", "SEKRETARIS", "BENDAHARA"].includes(p.kodeJabatan));
  const bidang = pengurus.filter((p) => p.kodeJabatan.startsWith("BIDANG_"));
  const kadiv = pengurus.filter((p) => p.kodeJabatan === "KADIV");
  const staffDivisi = pengurus.filter((p) => p.kodeJabatan === "STAFF_DIVISI");
  const digunakan = new Set([...dpo, ...inti, ...bidang, ...kadiv, ...staffDivisi].map((p) => p.id));
  const lainnya = pengurus.filter((p) => !digunakan.has(p.id));
  // Urutan divisi mengikuti `urutan` Kadiv/Staff yang diatur admin; divisi
  // yang hanya berisi anggota akan tetap ditambahkan otomatis di bagian akhir.
  const daftarDivisi = Array.from(new Set([...kadiv, ...staffDivisi].map((p) => p.divisi).concat(anggota.map((a) => a.divisi)).filter((d): d is string => Boolean(d))));

  return <div className="container-page py-16">
    <span className="section-eyebrow">Kepengurusan</span>
    <h1 className="section-title mb-10">Struktur Organisasi{dataPengurus[0]?.periodeMulai ? ` (${dataPengurus[0].periodeMulai}${dataPengurus[0].periodeAkhir ? ` – ${dataPengurus[0].periodeAkhir}` : ""})` : ""}</h1>
    {!pengurus.length && !anggota.length ? <p className="text-slate-500">Data struktur organisasi belum tersedia.</p> : <div className="space-y-12">
      <Seksi title="Dewan Pertimbangan Organisasi (DPO)" people={personPengurus(dpo)} />
      <Seksi title="Pengurus Inti" people={personPengurus(inti)} />
      <Seksi title="Bidang" people={personPengurus(bidang)} />
      <Seksi title="Pengurus Lainnya" people={personPengurus(lainnya)} />
      {daftarDivisi.map((divisi) => <section key={divisi} className="space-y-7">
        <h2 className="border-l-4 border-accent pl-3 text-xl font-semibold text-primary dark:text-accent">Divisi {divisi}</h2>
        <Seksi title="Kepala Divisi" people={personPengurus(kadiv.filter((p) => p.divisi === divisi))} />
        <Seksi title="Pengurus Divisi" people={personPengurus(staffDivisi.filter((p) => p.divisi === divisi))} />
        <Seksi title="Anggota Divisi" people={personAnggota(anggota.filter((a) => a.divisi === divisi))} />
      </section>)}
      <Seksi title="Anggota" people={personAnggota(anggota.filter((a) => !a.divisi))} />
    </div>}
  </div>;
}
