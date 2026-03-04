-- AlterTable
ALTER TABLE "User" ADD COLUMN "telegram_id" TEXT,
ADD COLUMN "slack_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegram_id_key" ON "User"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_slack_id_key" ON "User"("slack_id");
