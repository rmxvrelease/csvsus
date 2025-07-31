-- CreateTable
CREATE TABLE "ServState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "is_running" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Csv" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cnes" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "is_running" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
