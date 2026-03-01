-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('dog', 'cat', 'bird', 'fish', 'hamster', 'rabbit', 'other');

-- DropIndex
DROP INDEX "HealthDiet_user_id_date_idx";

-- DropIndex
DROP INDEX "HealthToilet_user_id_date_idx";

-- DropIndex
DROP INDEX "HealthWeight_user_id_date_idx";

-- AlterTable
ALTER TABLE "HealthDiet" ADD COLUMN     "pet_id" INTEGER;

-- AlterTable
ALTER TABLE "HealthToilet" ADD COLUMN     "pet_id" INTEGER;

-- AlterTable
ALTER TABLE "HealthWeight" ADD COLUMN     "pet_id" INTEGER;

-- CreateTable
CREATE TABLE "Pet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PetType" NOT NULL,
    "breed" TEXT,
    "gender" TEXT,
    "birthday" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "avatar_url" TEXT,
    "note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_user_id_idx" ON "Pet"("user_id");

-- CreateIndex
CREATE INDEX "HealthDiet_user_id_pet_id_date_idx" ON "HealthDiet"("user_id", "pet_id", "date");

-- CreateIndex
CREATE INDEX "HealthToilet_user_id_pet_id_date_idx" ON "HealthToilet"("user_id", "pet_id", "date");

-- CreateIndex
CREATE INDEX "HealthWeight_user_id_pet_id_date_idx" ON "HealthWeight"("user_id", "pet_id", "date");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthWeight" ADD CONSTRAINT "HealthWeight_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthDiet" ADD CONSTRAINT "HealthDiet_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthToilet" ADD CONSTRAINT "HealthToilet_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
