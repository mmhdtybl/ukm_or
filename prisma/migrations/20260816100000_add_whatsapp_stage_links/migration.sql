CREATE TABLE "LinkWhatsApp" (
    "id" TEXT NOT NULL,
    "tahap" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkWhatsApp_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LinkWhatsApp_tahap_key" ON "LinkWhatsApp"("tahap");
