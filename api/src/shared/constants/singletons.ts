export const singletons = {
  flow: {
    moneyAccount: Symbol("flow.moneyAccount"),
  },
  repo: {
    moneyAccount: Symbol("repo.moneyAccount"),
    moneyAccountAggregatedHistory: Symbol("repo.moneyAccountAggregatedHistory"),
    moneyAccountCapitalFlowHistory: Symbol(
      "repo.moneyAccountCapitalFlowHistory"
    ),
  },
  sdk: {
    ynab: Symbol("sdk.ynab"),
  },
};
