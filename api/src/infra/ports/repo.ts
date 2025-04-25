import { CashAccountAttr } from "../../models/index.js";
import { Timestamp } from "../../models/tables/common.js";

export type CashAccountCreateRepoInput = Omit<
  CashAccountAttr,
  keyof Timestamp | "cashAccountId"
>;
