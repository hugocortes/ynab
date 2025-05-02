/*
  Warnings:

  - The values [investmentContribution] on the enum `enum_CapitalAccountFlowHistory_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_CapitalAccountFlowHistory_type_new" AS ENUM ('debt', 'debtPayment', 'income', 'interest', 'market', 'transaction', 'transfer');
ALTER TABLE "CapitalAccountFlowHistory" ALTER COLUMN "type" TYPE "enum_CapitalAccountFlowHistory_type_new" USING ("type"::text::"enum_CapitalAccountFlowHistory_type_new");
ALTER TYPE "enum_CapitalAccountFlowHistory_type" RENAME TO "enum_CapitalAccountFlowHistory_type_old";
ALTER TYPE "enum_CapitalAccountFlowHistory_type_new" RENAME TO "enum_CapitalAccountFlowHistory_type";
DROP TYPE "enum_CapitalAccountFlowHistory_type_old";
COMMIT;
