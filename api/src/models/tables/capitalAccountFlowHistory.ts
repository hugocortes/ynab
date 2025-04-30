import { Timestamp } from "./common.js";
import { CapitalAccountId } from "./capitalAccount.js";

export const capitalAccountFlowHistoryType = [
  "debt", // can be initial debt, debt adjustment, or debt interest
  "debtPayment",
  "income",
  "investmentContribution",
  "market",
  "transaction",
] as const;
/**
 * @api
 */
export type CapitalAccountFlowHistoryType = {
  type: (typeof capitalAccountFlowHistoryType)[number];
};

/**
 * @api
 */
export type CapitalAccountFlowHistoryId = {
  /**
   * @format uuid
   */
  capitalAccountFlowHistoryId: string;
};

/**
 * @api
 */
export type CapitalAccountFlowHistoryAttr = CapitalAccountFlowHistoryId &
  CapitalAccountId &
  CapitalAccountFlowHistoryType &
  Timestamp & {
    amount: number;
    date: Date;
  };
