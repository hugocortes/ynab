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

    await Promise.all(
      budget.accounts.map(async (account) => {
        if (account.deleted) {
          return;
        }

        const cashAccountTypes = ["checking", "savings", "cash"];
        const investmentAccountTypes = ["otherAsset"];

        const isCashAccount = cashAccountTypes.includes(account.type);
        const isInvestmentAccount = investmentAccountTypes.includes(
          account.type
        );

        const assetNames = ["home"];
        const isAssetAccount =
          isInvestmentAccount &&
          assetNames.some((name) => account.name.toLowerCase().includes(name));

        const debtAccountTypes = [
          "personalLoan",
          "autoLoan",
          "otherDebt",
          "lineOfCredit",
        ];
        const isDebtAccount = debtAccountTypes.includes(account.type);

        const payload = {
          externalId: this.toCapitalAccountExternalId(budget.id, account.id),
          name: account.name,
          type: isAssetAccount
            ? ("asset" as const)
            : isCashAccount
              ? ("cash" as const)
              : isDebtAccount
                ? ("debt" as const)
                : isInvestmentAccount
                  ? ("investment" as const)
                  : undefined,
        };
        if (!payload.type) {
          return;
        }

        await this.capitalAccountRepo.create({
          ...payload,
          type: payload.type,
        });
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

  async createCapitalAccountDebtHistory() {
    const capitalAccounts = await this.capitalAccountRepo.find({
      pagination: {},
      query: {
        type: "debt",
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

        const history = await Promise.all(
          transactions.transactions.map(async (transaction, idx) => {
            const transactionDate = new Date(transaction.date);
            const middleOfDay = addHours(transactionDate, 12);

            const isDebt =
              transaction.debt_transaction_type === "charge" ||
              transaction.debt_transaction_type === "balanceAdjustment" ||
              transaction.debt_transaction_type === "credit" || // for stuff like returns
              transaction.payee_name === "Starting Balance";

            const isPayment =
              transaction.debt_transaction_type === "payment" ||
              !!transaction.transfer_transaction_id;

            const payload = {
              amount: transaction.amount / 1000,
              date: middleOfDay,
              capitalAccountId,
              type: isDebt
                ? ("debt" as const)
                : isPayment
                  ? ("debtPayment" as const)
                  : undefined,
            };
            if (!payload.type) {
              return;
            }

            return this.capitalAccountFlowHistoryRepo.create({
              ...payload,
              type: payload.type,
            });
          })
        );

        // create a final entry for interest if there is a positive balance
        const totalAmount = history
          .filter((entry) => !!entry)
          .reduce((acc, entry) => acc + (entry.amount ?? 0), 0);
        if (totalAmount > 0) {
          const lastEntry = history[history.length - 1];

          const transactionDate = new Date(lastEntry!.date);
          const middleOfDay = addHours(transactionDate, 12);
          const payload = {
            amount: -totalAmount,
            date: middleOfDay,
            capitalAccountId,
            type: "debt" as const,
          };
          await this.capitalAccountFlowHistoryRepo.create(payload);
        }
      },
      {
        concurrency: 5,
      }
    );
  }
}
