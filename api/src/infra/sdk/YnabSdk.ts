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
}
