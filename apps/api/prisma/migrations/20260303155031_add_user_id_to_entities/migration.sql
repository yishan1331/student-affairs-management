-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "CourseSession" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "GradeSheet" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "SalaryBase" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "user_id" INTEGER;

-- CreateIndex
CREATE INDEX "Attendance_user_id_idx" ON "Attendance"("user_id");

-- CreateIndex
CREATE INDEX "Course_user_id_idx" ON "Course"("user_id");

-- CreateIndex
CREATE INDEX "CourseSession_user_id_idx" ON "CourseSession"("user_id");

-- CreateIndex
CREATE INDEX "GradeSheet_user_id_idx" ON "GradeSheet"("user_id");

-- CreateIndex
CREATE INDEX "SalaryBase_user_id_idx" ON "SalaryBase"("user_id");

-- CreateIndex
CREATE INDEX "School_user_id_idx" ON "School"("user_id");

-- CreateIndex
CREATE INDEX "Student_user_id_idx" ON "Student"("user_id");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeSheet" ADD CONSTRAINT "GradeSheet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryBase" ADD CONSTRAINT "SalaryBase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSession" ADD CONSTRAINT "CourseSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
