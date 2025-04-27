import { Timestamp } from "./common.js";
import { MoneyAccountId } from "./moneyAccount.js";

export const moneyAccountCapitalFlowHistoryType = [
  "income",
  "investmentContribution",
  "market",
  "transaction",
] as const;
/**
 * @api
 */
export type MoneyAccountCapitalFlowHistoryType = {
  type: (typeof moneyAccountCapitalFlowHistoryType)[number];
};

/**
 * @api
 */
export type MoneyAccountCapitalFlowHistoryId = {
  /**
   * @format uuid
   */
  moneyAccountCapitalFlowHistoryId: string;
};

/**
 * @api
 */
export type MoneyAccountCapitalFlowHistoryAttr =
  MoneyAccountCapitalFlowHistoryId &
    MoneyAccountId &
    MoneyAccountCapitalFlowHistoryType &
    Timestamp & {
      amount: number;
      date: Date;
    };
