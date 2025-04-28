import { Timestamp } from "./common.js";
import { CapitalAccountId } from "./capitalAccount.js";

export const capitalAccountAggregatedHistoryPeriod = ["month"] as const;
/**
 * @api
 */
export type CapitalAccountAggregatedHistoryPeriod = {
  period: (typeof capitalAccountAggregatedHistoryPeriod)[number];
};

/**
 * @api
 */
export type CapitalAccountAggregatedHistoryId = {
  /**
   * @format uuid
   */
  capitalAccountAggregatedHistoryId: string;
};

/**
 * @api
 */
export type CapitalAccountAggregatedHistoryAttr =
  CapitalAccountAggregatedHistoryId &
    CapitalAccountId &
    CapitalAccountAggregatedHistoryPeriod &
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
