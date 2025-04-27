import { inject, injectable, singleton } from "tsyringe";
import { env } from "../../shared/index.js";
import ynab from "ynab";

export type YnabConfig = {
  apiKey: string;
};

export type YnabGetBudgetsRequest = {
  includeAccounts?: boolean;
};

@singleton()
@injectable()
export class YnabSdk {
  private readonly client: ynab.API;

  constructor(@inject(env.provider.ynab) config: YnabConfig) {
    this.client = new ynab.API(config.apiKey);
  }

  async getBudgets(payload: YnabGetBudgetsRequest) {
    const { data } = await this.client.budgets.getBudgets(
      payload.includeAccounts
    );
    return data;
  }

  /**
   * Amounts are returned in tenths of a cent.
   *
   * e.g. 10000 = $10.00
   *
   * Transactions are returned in ASC order.
   */
  async getTransactionsForAccount(budgetId: string, accountId: string) {
    const { data } = await this.client.transactions.getTransactionsByAccount(
      budgetId,
      accountId
    );

    return data;
  }
}
