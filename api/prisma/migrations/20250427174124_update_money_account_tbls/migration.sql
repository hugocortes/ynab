/*
  Warnings:

  - You are about to drop the `MoneyAccountHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "enum_MoneyAccountAggregatedHistory_period" AS ENUM ('month');

-- CreateEnum
CREATE TYPE "enum_MoneyAccountInflowHistory_type" AS ENUM ('income', 'investmentContribution');

-- CreateEnum
CREATE TYPE "enum_MoneyAccountOutflowHistory_type" AS ENUM ('market', 'transaction');

-- DropForeignKey
ALTER TABLE "MoneyAccountHistory" DROP CONSTRAINT "MoneyAccountHistory_moneyAccountId_fkey";

-- DropTable
DROP TABLE "MoneyAccountHistory";

-- DropEnum
DROP TYPE "enum_MoneyAccountHistory_period";

-- CreateTable
CREATE TABLE "MoneyAccountAggregatedHistory" (
    "moneyAccountAggregatedHistoryId" UUID NOT NULL,
    "moneyAccountId" UUID NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "period" "enum_MoneyAccountAggregatedHistory_period" NOT NULL,
    "totalCapitalFlow" DOUBLE PRECISION NOT NULL,
    "totalInflow" DOUBLE PRECISION NOT NULL,
    "totalOutflow" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MoneyAccountAggregatedHistory_pkey" PRIMARY KEY ("moneyAccountAggregatedHistoryId")
);

-- CreateTable
CREATE TABLE "MoneyAccountInflowHistory" (
    "moneyAccountInflowHistoryId" UUID NOT NULL,
    "moneyAccountId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "type" "enum_MoneyAccountInflowHistory_type" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MoneyAccountInflowHistory_pkey" PRIMARY KEY ("moneyAccountInflowHistoryId")
);

-- CreateTable
CREATE TABLE "MoneyAccountOutflowHistory" (
    "moneyAccountOutflowHistoryId" UUID NOT NULL,
    "moneyAccountId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "type" "enum_MoneyAccountOutflowHistory_type" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MoneyAccountOutflowHistory_pkey" PRIMARY KEY ("moneyAccountOutflowHistoryId")
);

-- AddForeignKey
ALTER TABLE "MoneyAccountAggregatedHistory" ADD CONSTRAINT "MoneyAccountAggregatedHistory_moneyAccountId_fkey" FOREIGN KEY ("moneyAccountId") REFERENCES "MoneyAccount"("moneyAccountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyAccountInflowHistory" ADD CONSTRAINT "MoneyAccountInflowHistory_moneyAccountId_fkey" FOREIGN KEY ("moneyAccountId") REFERENCES "MoneyAccount"("moneyAccountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyAccountOutflowHistory" ADD CONSTRAINT "MoneyAccountOutflowHistory_moneyAccountId_fkey" FOREIGN KEY ("moneyAccountId") REFERENCES "MoneyAccount"("moneyAccountId") ON DELETE CASCADE ON UPDATE CASCADE;
