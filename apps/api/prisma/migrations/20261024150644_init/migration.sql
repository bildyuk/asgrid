-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workbook" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbookMember" (
    "workbookId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkbookMember_pkey" PRIMARY KEY ("workbookId","userId")
);

-- CreateTable
CREATE TABLE "Sheet" (
    "id" UUID NOT NULL,
    "workbookId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cell" (
    "id" UUID NOT NULL,
    "sheetId" UUID NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "value" JSONB,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CellChange" (
    "id" UUID NOT NULL,
    "mutationId" UUID NOT NULL,
    "sheetId" UUID NOT NULL,
    "cellId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CellChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbookEvent" (
    "seq" SERIAL NOT NULL,
    "workbookId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkbookEvent_pkey" PRIMARY KEY ("seq")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Workbook_ownerId_idx" ON "Workbook"("ownerId");

-- CreateIndex
CREATE INDEX "WorkbookMember_userId_idx" ON "WorkbookMember"("userId");

-- CreateIndex
CREATE INDEX "Sheet_workbookId_idx" ON "Sheet"("workbookId");

-- CreateIndex
CREATE UNIQUE INDEX "Sheet_workbookId_name_key" ON "Sheet"("workbookId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Cell_sheetId_row_column_key" ON "Cell"("sheetId", "row", "column");

-- CreateIndex
CREATE UNIQUE INDEX "CellChange_mutationId_key" ON "CellChange"("mutationId");

-- CreateIndex
CREATE INDEX "CellChange_sheetId_createdAt_idx" ON "CellChange"("sheetId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkbookEvent_workbookId_seq_idx" ON "WorkbookEvent"("workbookId", "seq");

-- AddForeignKey
ALTER TABLE "Workbook" ADD CONSTRAINT "Workbook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbookMember" ADD CONSTRAINT "WorkbookMember_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "Workbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbookMember" ADD CONSTRAINT "WorkbookMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sheet" ADD CONSTRAINT "Sheet_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "Workbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellChange" ADD CONSTRAINT "CellChange_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellChange" ADD CONSTRAINT "CellChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbookEvent" ADD CONSTRAINT "WorkbookEvent_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "Workbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
