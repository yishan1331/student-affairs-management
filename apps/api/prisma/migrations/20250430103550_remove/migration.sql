/*
  Warnings:

  - You are about to drop the column `class_id` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_class_id_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "modifier_id" INTEGER;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "class_id";

-- DropTable
DROP TABLE "Class";

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
