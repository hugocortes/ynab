import { Timestamp } from "./common.js";

/**
 * @api
 */
export type CashAccountId = {
  /**
   * @format uuid
   */
  cashAccountId: string;
};

export type CashAccountAttr = CashAccountId &
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
