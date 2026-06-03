-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Course_deleted_at_idx" ON "Course"("deleted_at");
