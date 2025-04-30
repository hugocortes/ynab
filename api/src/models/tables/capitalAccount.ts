import { Timestamp } from "./common.js";

export const capitalAccountType = [
  "asset",
  "cash",
  "debt",
  "investment",
] as const;
/**
 * @api
 */
export type CapitalAccountType = {
  type: (typeof capitalAccountType)[number];
};

/**
 * @api
 */
export type CapitalAccountId = {
  /**
   * @format uuid
   */
  capitalAccountId: string;
};

export type CapitalAccountAttr = CapitalAccountId &
  CapitalAccountType &
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
export type CapitalAccountQuery = Partial<CapitalAccountType>;
