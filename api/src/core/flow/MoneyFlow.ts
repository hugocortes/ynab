import { inject, injectable, singleton } from "tsyringe";
import { singletons } from "../../shared/index.js";
import {
  MoneyAccountCapitalFlowHistoryRepo,
  MoneyAccountRepo,
  YnabSdk,
} from "../../infra/index.js";
import { startOfDay } from "date-fns";
import bb from "bluebird";

@injectable()
@singleton()
export class MoneyAccountFlow {
  constructor(
    @inject(singletons.repo.moneyAccount)
    private readonly moneyAccountRepo: MoneyAccountRepo,
    @inject(singletons.repo.moneyAccountCapitalFlowHistory)
    private readonly moneyAccountCapitalFlowHistoryRepo: MoneyAccountCapitalFlowHistoryRepo,

    @inject(singletons.sdk.ynab)
    private readonly ynabSdk: YnabSdk
  ) {}

  toMoneyAccountExternalId(budgetId: string, accountId: string) {
    return `urn:budget:${budgetId}:account:${accountId}`;
  }

  toBudgetIdentifiers(externalId: string) {
    const parts = externalId.split(":");
    if (parts.length !== 5) {
      throw new Error("Invalid externalId format");
    }

    const [, , budgetId, , accountId] = parts;

    return {
      budgetId,
      accountId,
    };
  }

  async creteMoneyAccounts() {
    const {
      budgets: [budget],
    } = await this.ynabSdk.getBudgets({
      includeAccounts: true,
    });

    if (!budget.accounts) {
      return;
    }

    const cashAccountTypes = ["checking", "savings", "cash"];
    const cashAccounts = budget.accounts.filter((account) =>
      cashAccountTypes.includes(account.type)
    );
    await Promise.all(
      cashAccounts.map(async (account) => {
        const payload = {
          externalId: this.toMoneyAccountExternalId(budget.id, account.id),
          name: account.name,
          type: "cash" as const,
        };

        await this.moneyAccountRepo.create(payload);
      })
    );

    const investmentAccountTypes = ["otherAsset"];
    const investmentAccounts = budget.accounts.filter((account) =>
      investmentAccountTypes.includes(account.type)
    );
    await Promise.all(
      investmentAccounts.map(async (account) => {
        const payload = {
          externalId: this.toMoneyAccountExternalId(budget.id, account.id),
          name: account.name,
          type: "investment" as const,
        };

        await this.moneyAccountRepo.create(payload);
      })
    );
  }

  async createMoneyAccountCapitalFlowHistory() {
    const moneyAccounts = await this.moneyAccountRepo.find({
      pagination: {},
      query: {
        type: "investment",
      },
    });

    await bb.Promise.map(
      moneyAccounts,
      async (moneyAccount) => {
        const { externalId, moneyAccountId } = moneyAccount;

        const { budgetId, accountId } = this.toBudgetIdentifiers(externalId);

        const transactions = await this.ynabSdk.getTransactionsForAccount(
          budgetId,
          accountId
        );

        await Promise.all(
          transactions.transactions.map(async (transaction) => {
            const transactionDate = new Date(transaction.date);

            const isContribution =
              transaction.payee_name === "Starting Balance" ||
              !!transaction.transfer_account_id;

            const payload = {
              amount: transaction.amount / 1000,
              date: startOfDay(transactionDate),
              moneyAccountId,
              type: isContribution
                ? ("investmentContribution" as const)
                : ("market" as const),
            };

            await this.moneyAccountCapitalFlowHistoryRepo.create(payload);
          })
        );
      },
      {
        concurrency: 5,
      }
    );
  }
}
