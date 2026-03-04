-- CreateEnum
CREATE TYPE "PetUserRole" AS ENUM ('owner', 'member');

-- CreateTable
CREATE TABLE "PetUser" (
    "id" SERIAL NOT NULL,
    "pet_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "PetUserRole" NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PetUser_user_id_idx" ON "PetUser"("user_id");

-- CreateIndex
CREATE INDEX "PetUser_pet_id_idx" ON "PetUser"("pet_id");

-- CreateIndex
CREATE UNIQUE INDEX "PetUser_pet_id_user_id_key" ON "PetUser"("pet_id", "user_id");

-- AddForeignKey
ALTER TABLE "PetUser" ADD CONSTRAINT "PetUser_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetUser" ADD CONSTRAINT "PetUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: Copy existing Pet owners to PetUser junction table
INSERT INTO "PetUser" ("pet_id", "user_id", "role", "created_at")
SELECT "id", "user_id", 'owner', NOW() FROM "Pet";
