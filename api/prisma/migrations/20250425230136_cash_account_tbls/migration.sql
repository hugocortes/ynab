-- CreateEnum
CREATE TYPE "enum_ChatAccountHistory_period" AS ENUM ('month');

-- CreateTable
CREATE TABLE "CashAccount" (
    "cashAccountId" UUID NOT NULL,
    "externalId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CashAccount_pkey" PRIMARY KEY ("cashAccountId")
);

-- CreateTable
CREATE TABLE "CashAccountHistory" (
    "cashAccountHistoryId" UUID NOT NULL,
    "cashAccountId" UUID NOT NULL,
    "balance" DOUBLE PRECISION,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "period" "enum_ChatAccountHistory_period" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CashAccountHistory_pkey" PRIMARY KEY ("cashAccountHistoryId")
);

-- AddForeignKey
ALTER TABLE "CashAccountHistory" ADD CONSTRAINT "CashAccountHistory_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "CashAccount"("cashAccountId") ON DELETE CASCADE ON UPDATE CASCADE;
