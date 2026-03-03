-- AlterTable
ALTER TABLE "HealthDiet" ADD COLUMN     "modifier_id" INTEGER;

-- AlterTable
ALTER TABLE "HealthSymptom" ADD COLUMN     "modifier_id" INTEGER;

-- AlterTable
ALTER TABLE "HealthToilet" ADD COLUMN     "modifier_id" INTEGER;

-- AlterTable
ALTER TABLE "HealthWeight" ADD COLUMN     "modifier_id" INTEGER;

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "modifier_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthWeight" ADD CONSTRAINT "HealthWeight_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthDiet" ADD CONSTRAINT "HealthDiet_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthToilet" ADD CONSTRAINT "HealthToilet_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthSymptom" ADD CONSTRAINT "HealthSymptom_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
