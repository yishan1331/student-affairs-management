-- AlterTable
ALTER TABLE "CourseSession" ADD COLUMN     "course_name" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "school_id" INTEGER,
ALTER COLUMN "course_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseSession" ADD CONSTRAINT "CourseSession_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
