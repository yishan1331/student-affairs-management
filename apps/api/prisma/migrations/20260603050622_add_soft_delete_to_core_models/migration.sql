-- AlterTable
ALTER TABLE "CourseSession" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SalaryBase" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "CourseSession_deleted_at_idx" ON "CourseSession"("deleted_at");

-- CreateIndex
CREATE INDEX "Pet_deleted_at_idx" ON "Pet"("deleted_at");

-- CreateIndex
CREATE INDEX "SalaryBase_deleted_at_idx" ON "SalaryBase"("deleted_at");

-- CreateIndex
CREATE INDEX "School_deleted_at_idx" ON "School"("deleted_at");

-- CreateIndex
CREATE INDEX "Student_deleted_at_idx" ON "Student"("deleted_at");

-- CreateIndex
CREATE INDEX "User_deleted_at_idx" ON "User"("deleted_at");
