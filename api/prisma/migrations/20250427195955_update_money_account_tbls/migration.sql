/*
  Warnings:

  - You are about to drop the `MoneyAccountInflowHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoneyAccountOutflowHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "enum_MoneyAccountCapitalFlowHistory_type" AS ENUM ('income', 'investmentContribution', 'market', 'transaction');

-- DropForeignKey
ALTER TABLE "MoneyAccountInflowHistory" DROP CONSTRAINT "MoneyAccountInflowHistory_moneyAccountId_fkey";

-- DropForeignKey
ALTER TABLE "MoneyAccountOutflowHistory" DROP CONSTRAINT "MoneyAccountOutflowHistory_moneyAccountId_fkey";

-- DropTable
DROP TABLE "MoneyAccountInflowHistory";

-- DropTable
DROP TABLE "MoneyAccountOutflowHistory";

-- DropEnum
DROP TYPE "enum_MoneyAccountInflowHistory_type";

-- DropEnum
DROP TYPE "enum_MoneyAccountOutflowHistory_type";

-- CreateTable
CREATE TABLE "MoneyAccountCapitalFlowHistory" (
    "moneyAccountCapitalFlowHistoryId" UUID NOT NULL,
    "moneyAccountId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "type" "enum_MoneyAccountCapitalFlowHistory_type" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MoneyAccountCapitalFlowHistory_pkey" PRIMARY KEY ("moneyAccountCapitalFlowHistoryId")
);

-- AddForeignKey
ALTER TABLE "MoneyAccountCapitalFlowHistory" ADD CONSTRAINT "MoneyAccountCapitalFlowHistory_moneyAccountId_fkey" FOREIGN KEY ("moneyAccountId") REFERENCES "MoneyAccount"("moneyAccountId") ON DELETE CASCADE ON UPDATE CASCADE;
