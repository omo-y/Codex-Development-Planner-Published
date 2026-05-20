-- CreateTable
CREATE TABLE "ProjectPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "appName" TEXT NOT NULL,
    "appIdea" TEXT NOT NULL,
    "targetUser" TEXT NOT NULL,
    "appType" TEXT NOT NULL,
    "developmentStack" TEXT NOT NULL,
    "aiOption" TEXT NOT NULL,
    "storageOption" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "screens" TEXT NOT NULL,
    "extraNotes" TEXT,
    "generatedPrompt" TEXT NOT NULL
);
