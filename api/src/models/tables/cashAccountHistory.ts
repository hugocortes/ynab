import { Timestamp } from "./common.js";

export const cashAccountHistoryPeriod = ["month"] as const;
/**
 * @api
 */
export type CashAccountHistoryPeriod = {
  period: (typeof cashAccountHistoryPeriod)[number];
};

/**
 * @api
 */
export type CashAccountHistoryId = {
  /**
   * @format uuid
   */
  cashAccountHistoryId: string;
};

export type CashAccountHistoryAttr = CashAccountHistoryId &
  CashAccountHistoryPeriod &
  Timestamp & {
    balance: number;
    date: Date;
  };
