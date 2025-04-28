/*
  Warnings:

  - You are about to drop the `MoneyAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoneyAccountAggregatedHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoneyAccountCapitalFlowHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "enum_CapitalAccount_type" AS ENUM ('cash', 'investment');

-- CreateEnum
CREATE TYPE "enum_CapitalAccountAggregatedHistory_period" AS ENUM ('month');

-- CreateEnum
CREATE TYPE "enum_CapitalAccountFlowHistory_type" AS ENUM ('income', 'investmentContribution', 'market', 'transaction');

-- DropForeignKey
ALTER TABLE "MoneyAccountAggregatedHistory" DROP CONSTRAINT "MoneyAccountAggregatedHistory_moneyAccountId_fkey";

-- DropForeignKey
ALTER TABLE "MoneyAccountCapitalFlowHistory" DROP CONSTRAINT "MoneyAccountCapitalFlowHistory_moneyAccountId_fkey";

-- DropTable
DROP TABLE "MoneyAccount";

-- DropTable
DROP TABLE "MoneyAccountAggregatedHistory";

-- DropTable
DROP TABLE "MoneyAccountCapitalFlowHistory";

-- DropEnum
DROP TYPE "enum_MoneyAccountAggregatedHistory_period";

-- DropEnum
DROP TYPE "enum_MoneyAccountCapitalFlowHistory_type";

-- DropEnum
DROP TYPE "enum_MoneyAccount_type";

-- CreateTable
CREATE TABLE "CapitalAccount" (
    "capitalAccountId" UUID NOT NULL,
    "externalId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "enum_CapitalAccount_type" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CapitalAccount_pkey" PRIMARY KEY ("capitalAccountId")
);

-- CreateTable
CREATE TABLE "CapitalAccountAggregatedHistory" (
    "capitalAccountAggregatedHistoryId" UUID NOT NULL,
    "capitalAccountId" UUID NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "period" "enum_CapitalAccountAggregatedHistory_period" NOT NULL,
    "totalCapitalFlow" DOUBLE PRECISION NOT NULL,
    "totalInflow" DOUBLE PRECISION NOT NULL,
    "totalOutflow" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CapitalAccountAggregatedHistory_pkey" PRIMARY KEY ("capitalAccountAggregatedHistoryId")
);

-- CreateTable
CREATE TABLE "CapitalAccountFlowHistory" (
    "capitalAccountFlowHistoryId" UUID NOT NULL,
    "capitalAccountId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "type" "enum_CapitalAccountFlowHistory_type" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CapitalAccountFlowHistory_pkey" PRIMARY KEY ("capitalAccountFlowHistoryId")
);

-- AddForeignKey
ALTER TABLE "CapitalAccountAggregatedHistory" ADD CONSTRAINT "CapitalAccountAggregatedHistory_capitalAccountId_fkey" FOREIGN KEY ("capitalAccountId") REFERENCES "CapitalAccount"("capitalAccountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapitalAccountFlowHistory" ADD CONSTRAINT "CapitalAccountFlowHistory_capitalAccountId_fkey" FOREIGN KEY ("capitalAccountId") REFERENCES "CapitalAccount"("capitalAccountId") ON DELETE CASCADE ON UPDATE CASCADE;
