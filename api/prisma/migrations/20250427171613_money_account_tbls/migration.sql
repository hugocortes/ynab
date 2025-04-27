/*
  Warnings:

  - You are about to drop the `CashAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CashAccountHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "enum_MoneyAccountHistory_period" AS ENUM ('month');

-- CreateEnum
CREATE TYPE "enum_MoneyAccount_type" AS ENUM ('cash', 'investment');

-- DropForeignKey
ALTER TABLE "CashAccountHistory" DROP CONSTRAINT "CashAccountHistory_cashAccountId_fkey";

-- DropTable
DROP TABLE "CashAccount";

-- DropTable
DROP TABLE "CashAccountHistory";

-- DropEnum
DROP TYPE "enum_ChatAccountHistory_period";

-- CreateTable
CREATE TABLE "MoneyAccount" (
    "moneyAccountId" UUID NOT NULL,
    "externalId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "enum_MoneyAccount_type" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MoneyAccount_pkey" PRIMARY KEY ("moneyAccountId")
);

-- CreateTable
CREATE TABLE "MoneyAccountHistory" (
    "moneyAccountHistoryId" UUID NOT NULL,
    "moneyAccountId" UUID NOT NULL,
    "balance" DOUBLE PRECISION,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "period" "enum_MoneyAccountHistory_period" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MoneyAccountHistory_pkey" PRIMARY KEY ("moneyAccountHistoryId")
);

-- AddForeignKey
ALTER TABLE "MoneyAccountHistory" ADD CONSTRAINT "MoneyAccountHistory_moneyAccountId_fkey" FOREIGN KEY ("moneyAccountId") REFERENCES "MoneyAccount"("moneyAccountId") ON DELETE CASCADE ON UPDATE CASCADE;
