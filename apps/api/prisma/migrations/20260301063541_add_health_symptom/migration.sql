-- CreateEnum
CREATE TYPE "SymptomType" AS ENUM ('vomiting', 'coughing', 'diarrhea', 'skin_issue', 'eye_issue', 'ear_issue', 'appetite_loss', 'lethargy', 'breathing_issue', 'limping', 'scratching', 'sneezing', 'fever', 'other');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('mild', 'moderate', 'severe');

-- CreateTable
CREATE TABLE "HealthSymptom" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pet_id" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "symptom_type" "SymptomType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "duration_minutes" INTEGER,
    "body_part" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthSymptom_user_id_pet_id_date_idx" ON "HealthSymptom"("user_id", "pet_id", "date");

-- AddForeignKey
ALTER TABLE "HealthSymptom" ADD CONSTRAINT "HealthSymptom_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthSymptom" ADD CONSTRAINT "HealthSymptom_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
