-- DropIndex
DROP INDEX "CellChange_mutationId_key";

-- AlterTable
ALTER TABLE "CellChange" ADD COLUMN     "seq" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WorkbookEvent" ADD COLUMN     "sheetId" UUID;

-- CreateIndex
CREATE INDEX "CellChange_mutationId_idx" ON "CellChange"("mutationId");

-- CreateIndex
CREATE INDEX "WorkbookEvent_sheetId_seq_idx" ON "WorkbookEvent"("sheetId", "seq");
