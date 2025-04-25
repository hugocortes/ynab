import { inject, injectable, singleton } from "tsyringe";
import { env } from "../../shared/index.js";
import ynab from "ynab";

export type YnabConfig = {
  apiKey: string;
};

@singleton()
@injectable()
export class YnabSdk {
  private readonly client: ynab.API;

  constructor(@inject(env.provider.ynab) config: YnabConfig) {
    this.client = new ynab.API(config.apiKey);
  }

  async getBudgets() {
    const { data } = await this.client.budgets.getBudgets();
    return data;
  }
}
