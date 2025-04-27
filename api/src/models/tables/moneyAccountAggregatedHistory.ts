import { Timestamp } from "./common.js";
import { MoneyAccountId } from "./moneyAccount.js";

export const moneyAccountAggregatedHistoryPeriod = ["month"] as const;
/**
 * @api
 */
export type MoneyAccountAggregatedHistoryPeriod = {
  period: (typeof moneyAccountAggregatedHistoryPeriod)[number];
};

/**
 * @api
 */
export type MoneyAccountAggregatedHistoryId = {
  /**
   * @format uuid
   */
  moneyAccountAggregatedHistoryId: string;
};

/**
 * @api
 */
export type MoneyAccountAggregatedHistoryAttr =
  MoneyAccountAggregatedHistoryId &
    MoneyAccountId &
    MoneyAccountAggregatedHistoryPeriod &
    Timestamp & {
      /**
       * @description Represents the total balance of the account at the end of
       * the specified period.
       */
      balance: number;
      date: Date;
      /**
       * @description Represents inflow from outside factors such as savings accounts
       * paying interest, dividends from stocks, or general market fluctuations.
       */
      totalCapitalFlow: number;
      /**
       * @description Contributions made to the account, such as deposits or transfers
       * from other accounts.
       */
      totalInflow: number;
      /**
       * @description Withdrawals or expenses that reduce the account balance.
       */
      totalOutflow: number;
    };
