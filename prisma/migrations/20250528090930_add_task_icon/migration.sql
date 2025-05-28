-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "icon" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "frequency" INTEGER,
    "score" INTEGER NOT NULL DEFAULT 0,
    "lastCompleted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "requiresComment" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Task" ("archived", "description", "flagged", "frequency", "id", "lastCompleted", "requiresComment", "score", "title") SELECT "archived", "description", "flagged", "frequency", "id", "lastCompleted", "requiresComment", "score", "title" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
