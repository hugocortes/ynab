import { inject, injectable, singleton } from "tsyringe";
import { singletons } from "../../shared/index.js";
import { CashAccountRepo, YnabSdk } from "../../infra/index.js";

@injectable()
@singleton()
export class CashAccountFlow {
  constructor(
    @inject(singletons.repo.cashAccount)
    private readonly cashAccountRepo: CashAccountRepo,

    @inject(singletons.sdk.ynab)
    private readonly ynabSdk: YnabSdk
  ) {}

  toCashAccountExternalId(budgetId: string, accountId: string) {
    return `urn:budget:${budgetId}:account:${accountId}`;
  }

  async creteCashAccounts() {
    const {
      budgets: [budget],
    } = await this.ynabSdk.getBudgets({
      includeAccounts: true,
    });

    if (!budget.accounts) {
      return;
    }

    const validCashAccountTypes = ["checking", "savings", "cash"];
    const validCashAccounts = budget.accounts.filter((account) =>
      validCashAccountTypes.includes(account.type)
    );

    await Promise.all(
      validCashAccounts.map(async (account) => {
        const payload = {
          externalId: this.toCashAccountExternalId(budget.id, account.id),
          name: account.name,
        };

        await this.cashAccountRepo.create(payload);
      })
    );
  }
}
