import {
  CapitalAccountAttr,
  CapitalAccountFlowHistoryAttr,
} from "../../models/index.js";
import { Timestamp } from "../../models/tables/common.js";

export type CapitalAccountCreateRepoInput = Omit<
  CapitalAccountAttr,
  keyof Timestamp | "capitalAccountId"
>;

export type CapitalAccountFlowHistoryRepoInput = Omit<
  CapitalAccountFlowHistoryAttr,
  keyof Timestamp | "capitalAccountFlowHistoryId"
>;
