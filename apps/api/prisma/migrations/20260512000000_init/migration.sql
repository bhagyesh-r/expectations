-- CreateEnum
CREATE TYPE "DailyStatus" AS ENUM ('DONE', 'NOT_TODAY', 'NEEDS_DISCUSSION', 'SKIPPED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('THREE_DAY_CHECK_IN_STREAK', 'APPRECIATION_STAR', 'TEAMWORK_MOMENT', 'CONSISTENCY_COUPLE', 'KIND_NOTE_SENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "coupleSpaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoupleSpace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coupleCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CoupleSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpectationSet" (
    "id" TEXT NOT NULL,
    "coupleSpaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExpectationSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expectation" (
    "id" TEXT NOT NULL,
    "expectationSetId" TEXT NOT NULL,
    "coupleSpaceId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "expectedFromUserId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Expectation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyExpectationStatus" (
    "id" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,
    "expectationSetId" TEXT NOT NULL,
    "coupleSpaceId" TEXT NOT NULL,
    "markedByUserId" TEXT NOT NULL,
    "expectedFromUserId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "DailyStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DailyExpectationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppreciationNote" (
    "id" TEXT NOT NULL,
    "coupleSpaceId" TEXT NOT NULL,
    "expectationSetId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppreciationNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "coupleSpaceId" TEXT NOT NULL,
    "userId" TEXT,
    "badgeType" "BadgeType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleSpace_coupleCode_key" ON "CoupleSpace"("coupleCode");

-- CreateIndex
CREATE INDEX "ExpectationSet_coupleSpaceId_startDate_endDate_idx" ON "ExpectationSet"("coupleSpaceId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Expectation_expectationSetId_createdByUserId_idx" ON "Expectation"("expectationSetId", "createdByUserId");

-- CreateIndex
CREATE INDEX "Expectation_coupleSpaceId_expectedFromUserId_idx" ON "Expectation"("coupleSpaceId", "expectedFromUserId");

-- CreateIndex
CREATE INDEX "DailyExpectationStatus_expectationSetId_date_idx" ON "DailyExpectationStatus"("expectationSetId", "date");

-- CreateIndex
CREATE INDEX "DailyExpectationStatus_coupleSpaceId_date_idx" ON "DailyExpectationStatus"("coupleSpaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyExpectationStatus_expectationId_markedByUserId_date_key" ON "DailyExpectationStatus"("expectationId", "markedByUserId", "date");

-- CreateIndex
CREATE INDEX "AppreciationNote_coupleSpaceId_date_idx" ON "AppreciationNote"("coupleSpaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AppreciationNote_expectationSetId_createdByUserId_date_key" ON "AppreciationNote"("expectationSetId", "createdByUserId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_coupleSpaceId_userId_badgeType_key" ON "Badge"("coupleSpaceId", "userId", "badgeType");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectationSet" ADD CONSTRAINT "ExpectationSet_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectationSet" ADD CONSTRAINT "ExpectationSet_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expectation" ADD CONSTRAINT "Expectation_expectationSetId_fkey" FOREIGN KEY ("expectationSetId") REFERENCES "ExpectationSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expectation" ADD CONSTRAINT "Expectation_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expectation" ADD CONSTRAINT "Expectation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expectation" ADD CONSTRAINT "Expectation_expectedFromUserId_fkey" FOREIGN KEY ("expectedFromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpectationStatus" ADD CONSTRAINT "DailyExpectationStatus_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "Expectation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpectationStatus" ADD CONSTRAINT "DailyExpectationStatus_expectationSetId_fkey" FOREIGN KEY ("expectationSetId") REFERENCES "ExpectationSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpectationStatus" ADD CONSTRAINT "DailyExpectationStatus_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpectationStatus" ADD CONSTRAINT "DailyExpectationStatus_markedByUserId_fkey" FOREIGN KEY ("markedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpectationStatus" ADD CONSTRAINT "DailyExpectationStatus_expectedFromUserId_fkey" FOREIGN KEY ("expectedFromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppreciationNote" ADD CONSTRAINT "AppreciationNote_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppreciationNote" ADD CONSTRAINT "AppreciationNote_expectationSetId_fkey" FOREIGN KEY ("expectationSetId") REFERENCES "ExpectationSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppreciationNote" ADD CONSTRAINT "AppreciationNote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_coupleSpaceId_fkey" FOREIGN KEY ("coupleSpaceId") REFERENCES "CoupleSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
