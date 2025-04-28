import { inject, injectable, singleton } from "tsyringe";
import { singletons } from "../../shared/index.js";
import {
  CapitalAccountFlowHistoryRepo,
  CapitalAccountRepo,
  YnabSdk,
} from "../../infra/index.js";
import { addHours } from "date-fns";
import bb from "bluebird";

@injectable()
@singleton()
export class CapitalAccountFlow {
  constructor(
    @inject(singletons.repo.capitalAccount)
    private readonly capitalAccountRepo: CapitalAccountRepo,
    @inject(singletons.repo.capitalAccountFlowHistory)
    private readonly capitalAccountFlowHistoryRepo: CapitalAccountFlowHistoryRepo,

    @inject(singletons.sdk.ynab)
    private readonly ynabSdk: YnabSdk
  ) {}

  toCapitalAccountExternalId(budgetId: string, accountId: string) {
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

  async creteCapitalAccounts() {
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
          externalId: this.toCapitalAccountExternalId(budget.id, account.id),
          name: account.name,
          type: "cash" as const,
        };

        await this.capitalAccountRepo.create(payload);
      })
    );

    const investmentAccountTypes = ["otherAsset"];
    const investmentAccounts = budget.accounts.filter((account) =>
      investmentAccountTypes.includes(account.type)
    );
    await Promise.all(
      investmentAccounts.map(async (account) => {
        const payload = {
          externalId: this.toCapitalAccountExternalId(budget.id, account.id),
          name: account.name,
          type: "investment" as const,
        };

        await this.capitalAccountRepo.create(payload);
      })
    );
  }

  async createCapitalAccountFlowHistory() {
    const capitalAccounts = await this.capitalAccountRepo.find({
      pagination: {},
      query: {
        type: "investment",
      },
    });

    await bb.Promise.map(
      capitalAccounts,
      async (capitalAccount) => {
        const { externalId, capitalAccountId } = capitalAccount;

        const { budgetId, accountId } = this.toBudgetIdentifiers(externalId);

        const transactions = await this.ynabSdk.getTransactionsForAccount(
          budgetId,
          accountId
        );

        await Promise.all(
          transactions.transactions.map(async (transaction) => {
            const transactionDate = new Date(transaction.date);
            const middleOfDay = addHours(transactionDate, 12);

            const isContribution =
              transaction.payee_name === "Starting Balance" ||
              transaction.payee_name === "Reconciliation Balance Adjustment" ||
              transaction.payee_name?.toLowerCase().includes("contribution") || // custom name before YNAB tracking
              !!transaction.transfer_account_id;

            const payload = {
              amount: transaction.amount / 1000,
              date: middleOfDay,
              capitalAccountId,
              type: isContribution
                ? ("investmentContribution" as const)
                : ("market" as const),
            };

            await this.capitalAccountFlowHistoryRepo.create(payload);
          })
        );
      },
      {
        concurrency: 5,
      }
    );
  }
}
