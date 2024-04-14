-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "frequency" INTEGER,
    "score" INTEGER NOT NULL DEFAULT 0,
    "lastCompleted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Task" ("frequency", "id", "lastCompleted", "score", "title") SELECT "frequency", "id", "lastCompleted", "score", "title" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_History" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "History_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_History" ("createdAt", "id", "taskId", "userId") SELECT "createdAt", "id", "taskId", "userId" FROM "History";
DROP TABLE "History";
ALTER TABLE "new_History" RENAME TO "History";
CREATE INDEX "History_createdAt_idx" ON "History"("createdAt" DESC);
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
