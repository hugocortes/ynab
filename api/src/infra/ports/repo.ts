import {
  MoneyAccountAttr,
  MoneyAccountCapitalFlowHistoryAttr,
} from "../../models/index.js";
import { Timestamp } from "../../models/tables/common.js";

export type MoneyAccountCreateRepoInput = Omit<
  MoneyAccountAttr,
  keyof Timestamp | "moneyAccountId"
>;

export type MoneyAccountCapitalFlowHistoryRepoInput = Omit<
  MoneyAccountCapitalFlowHistoryAttr,
  keyof Timestamp | "moneyAccountCapitalFlowHistoryId"
>;
