CREATE TABLE "PendaftaranGoogle" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendaftaranGoogle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PendaftaranGoogle_email_key" ON "PendaftaranGoogle"("email");
CREATE INDEX "PendaftaranGoogle_status_idx" ON "PendaftaranGoogle"("status");
