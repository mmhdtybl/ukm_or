ALTER TABLE "PendaftaranGoogle" ADD COLUMN "nim" TEXT;

ALTER TABLE "Pengurus"
  ADD COLUMN "noHp" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Aktif';
