-- CreateTable
CREATE TABLE "Medication" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "chemicalComposition" TEXT NOT NULL,
    "stockAvailability" INTEGER NOT NULL,
    "shelfLocation" TEXT NOT NULL,
    "boxPrice" DECIMAL(65,30) NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "usefulness" TEXT NOT NULL,
    "samplePhotoUrl" TEXT NOT NULL,
    "dosageInstructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);
