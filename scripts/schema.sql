-- CreateTable
CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "duration" TEXT,
    "url" TEXT,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "Video_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "subPattern" TEXT,
    "difficulty" TEXT,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "solvedAt" DATETIME,
    "notes" TEXT,
    "revisionLevel" INTEGER NOT NULL DEFAULT 0,
    "masteryScore" INTEGER NOT NULL DEFAULT 0,
    "isHomework" BOOLEAN NOT NULL DEFAULT false,
    "isChallenge" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Problem_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "problemId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "completedDate" DATETIME,
    "revisionNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "Revision_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "durationMins" INTEGER NOT NULL DEFAULT 0,
    "patternId" TEXT,
    "notes" TEXT,
    CONSTRAINT "StudySession_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "targetVideos" INTEGER NOT NULL DEFAULT 2,
    "targetProblems" INTEGER NOT NULL DEFAULT 3,
    "targetStudyMins" INTEGER NOT NULL DEFAULT 120,
    "completedVideos" INTEGER NOT NULL DEFAULT 0,
    "completedProblems" INTEGER NOT NULL DEFAULT 0,
    "completedStudyMins" INTEGER NOT NULL DEFAULT 0,
    "missionScore" REAL NOT NULL DEFAULT 0,
    "journalEntry" TEXT,
    "isStudyDay" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "PatternNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patternId" TEXT NOT NULL,
    "keyLearnings" TEXT,
    "mistakes" TEXT,
    "revisionNotes" TEXT,
    CONSTRAINT "PatternNote_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "targetDate" DATETIME,
    "dailyTargetVideos" INTEGER NOT NULL DEFAULT 2,
    "dailyTargetProblems" INTEGER NOT NULL DEFAULT 3,
    "dailyTargetStudyMins" INTEGER NOT NULL DEFAULT 120,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Pattern_name_key" ON "Pattern"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_date_key" ON "DailyLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PatternNote_patternId_key" ON "PatternNote"("patternId");

