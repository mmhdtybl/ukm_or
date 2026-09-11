import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { FiUser } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";

export const metadata = { title: "Struktur Organisasi" };
export const dynamic = "force-dynamic";

type Person = {
  id: string;
  nama: string;
  jabatan: string;
  divisi?: string | null;
  foto?: string | null;
  crown?: boolean;
};

function KartuOrang({ person }: { person: Person }) {
  return (
    <article className="group relative rounded-3xl border border-slate-200/70 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="absolute inset-x-0 top-0 h-20 rounded-t-[23px] bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 opacity-90" />

      {person.crown && (
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="anim-crown-float">
            <span className="anim-crown-glow grid h-10 w-10 place-items-center rounded-full bg-white shadow-lg ring-2 ring-yellow-400 dark:bg-slate-800 dark:ring-yellow-500/80">
              <FaCrown className="h-5 w-5 text-yellow-500" />
            </span>
          </div>
        </div>
      )}

      <div className="relative mx-auto mb-5 h-20 w-20 sm:mt-3 sm:h-28 sm:w-28">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg sm:h-28 sm:w-28 dark:border-slate-800 dark:bg-slate-700">
          {person.foto ? (
            <Image
              src={person.foto}
              alt={`Foto ${person.nama}`}
              fill
              sizes="80px, (min-width: 640px) 112px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <FiUser size={32} className="text-slate-400 sm:size-10" />
            </div>
          )}
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
        {person.nama}
      </h3>

      <p className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 sm:px-3 sm:text-xs dark:bg-blue-900/30 dark:text-blue-300">
        {person.jabatan}
      </p>

      {person.divisi && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Divisi {person.divisi}
        </p>
      )}
    </article>
  );
}

function Seksi({
  title,
  people,
  boxed = true,
}: {
  title: string;
  people: Person[];
  boxed?: boolean;
}) {
  if (!people.length) return null;

  return (
    <section
      className={
        boxed
          ? "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-6 sm:p-6 dark:border-slate-700 dark:bg-slate-800"
          : "space-y-6"
      }
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-blue-600" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {people.length} Orang
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
        {people.map((person) => (
          <KartuOrang key={person.id} person={person} />
        ))}
      </div>
    </section>
  );
}

export default async function StrukturPage() {
  const [dataPengurus, dataAnggota] = await Promise.all([
    prisma.pengurus.findMany({
      where: { isActive: true },
      include: { user: { select: { avatar: true, role: true } } },
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    }),
    prisma.anggota.findMany({
      include: { user: { select: { avatar: true, role: true } } },
      orderBy: [{ divisi: "asc" }, { nama: "asc" }],
    }),
  ]);

  const pengurus = dataPengurus.filter((p) => p.user?.role !== "ADMIN");

  const userPengurus = new Set(
    pengurus.flatMap((p) => (p.userId ? [p.userId] : []))
  );

  const anggota = dataAnggota.filter(
    (a) =>
      a.user?.role !== "ADMIN" &&
      (!a.userId || !userPengurus.has(a.userId))
  );

  const personPengurus = (list: typeof pengurus): Person[] =>
    list.map((p) => ({
      id: `pengurus-${p.id}`,
      nama: p.nama,
      jabatan: p.jabatan,
      divisi: p.divisi,
      foto: p.user?.avatar || p.foto,
      crown:
        p.kodeJabatan === "KETUA_UMUM" ||
        (p.kodeJabatan.startsWith("BIDANG_") &&
          !p.kodeJabatan.endsWith("_STAFF")) ||
        p.kodeJabatan === "KADIV",
    }));

  const personAnggota = (list: typeof anggota): Person[] =>
    list.map((a) => ({
      id: `anggota-${a.id}`,
      nama: a.nama,
      jabatan: "Anggota",
      divisi: a.divisi,
      foto: a.user?.avatar || a.foto,
    }));

  const dpo = pengurus.filter((p) => p.kodeJabatan === "DPO");

  const bph = pengurus.filter((p) =>
    ["KETUA_UMUM", "WAKIL_KETUA", "SEKRETARIS", "BENDAHARA"].includes(
      p.kodeJabatan
    )
  );

  const bphBidang = pengurus.filter((p) =>
    p.kodeJabatan.startsWith("BIDANG_")
  );

  const kadiv = pengurus.filter((p) => p.kodeJabatan === "KADIV");

  const staffDivisi = pengurus.filter(
    (p) => p.kodeJabatan === "STAFF_DIVISI"
  );

  const digunakan = new Set(
    [...dpo, ...bph, ...bphBidang, ...kadiv, ...staffDivisi].map((p) => p.id)
  );

  const lainnya = pengurus.filter((p) => !digunakan.has(p.id));

  const daftarDivisi = Array.from(
    new Set(
      [...kadiv, ...staffDivisi]
        .map((p) => p.divisi)
        .concat(anggota.map((a) => a.divisi))
        .filter((d): d is string => Boolean(d))
    )
  );

  // Periode dihitung dinamis dari tahun berjalan (contoh: 2026/2027)
  const tahun = new Date().getFullYear();
  const periode = `${tahun}/${tahun + 1}`;

  return (
    <div className="container-page py-16">
      <section className="relative mb-16 overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 px-6 py-12 text-white sm:px-8 sm:py-14">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

        <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
          Kepengurusan UKM Olahraga
        </span>

        <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
          Struktur Organisasi
        </h1>

        <p className="mt-3 max-w-2xl text-blue-100">
          Susunan kepengurusan UKM Olahraga yang aktif beserta pembagian
          Badan Pengurus Harian, Bidang, Divisi, dan Anggota.
        </p>

        {periode && (
          <div className="mt-6 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            Periode {periode}
          </div>
        )}
      </section>

      {!pengurus.length && !anggota.length ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-slate-500">
            Data struktur organisasi belum tersedia.
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          <Seksi
            title="Dewan Pertimbangan Organisasi (DPO)"
            people={personPengurus(dpo)}
          />

          <Seksi
            title="BPH (Badan Pengurus Harian)"
            people={personPengurus(bph)}
          />

          <Seksi
            title="BPH Bidang"
            people={personPengurus(bphBidang)}
          />

          <Seksi
            title="Pengurus Lainnya"
            people={personPengurus(lainnya)}
          />

          {daftarDivisi.map((divisi) => (
            <section
              key={divisi}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Cabang Olahraga
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Divisi {divisi}
                  </h2>
                </div>
              </div>

              <div className="space-y-8">
                <Seksi
                  boxed={false}
                  title="Kepala Divisi"
                  people={personPengurus(
                    kadiv.filter((p) => p.divisi === divisi)
                  )}
                />

                <Seksi
                  boxed={false}
                  title="Pengurus Divisi"
                  people={personPengurus(
                    staffDivisi.filter((p) => p.divisi === divisi)
                  )}
                />

                <Seksi
                  boxed={false}
                  title="Anggota Divisi"
                  people={personAnggota(
                    anggota.filter((a) => a.divisi === divisi)
                  )}
                />
              </div>
            </section>
          ))}

          <Seksi
            title="Anggota"
            people={personAnggota(anggota.filter((a) => !a.divisi))}
          />
        </div>
      )}
    </div>
  );
}