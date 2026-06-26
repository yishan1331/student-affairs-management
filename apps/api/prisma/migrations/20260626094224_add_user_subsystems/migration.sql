-- CreateEnum
CREATE TYPE "Subsystem" AS ENUM ('course', 'health');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subsystems" "Subsystem"[] DEFAULT ARRAY['course', 'health']::"Subsystem"[];
