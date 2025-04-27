import { Timestamp } from "./common.js";

export const moneyAccountType = ["cash", "investment"] as const;
/**
 * @api
 */
export type MoneyAccountType = {
  type: (typeof moneyAccountType)[number];
};

/**
 * @api
 */
export type MoneyAccountId = {
  /**
   * @format uuid
   */
  moneyAccountId: string;
};

export type MoneyAccountAttr = MoneyAccountId &
  MoneyAccountType &
  Timestamp & {
    /**
     * @maxLength 255
     */
    externalId: string;
    /**
     * @maxLength 255
     */
    name: string;
  };

/**
 * @api
 */
export type MoneyAccountQuery = Partial<MoneyAccountType>;
