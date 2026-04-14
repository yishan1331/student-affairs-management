-- CreateTable
CREATE TABLE "_CourseToSalaryBase" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CourseToSalaryBase_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToSalaryBase_B_index" ON "_CourseToSalaryBase"("B");

-- AddForeignKey
ALTER TABLE "_CourseToSalaryBase" ADD CONSTRAINT "_CourseToSalaryBase_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToSalaryBase" ADD CONSTRAINT "_CourseToSalaryBase_B_fkey" FOREIGN KEY ("B") REFERENCES "SalaryBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
