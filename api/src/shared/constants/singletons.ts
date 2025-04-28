export const singletons = {
  flow: {
    capitalAccount: Symbol("flow.capitalAccount"),
  },
  repo: {
    capitalAccount: Symbol("repo.capitalAccount"),
    capitalAccountAggregatedHistory: Symbol(
      "repo.capitalAccountAggregatedHistory"
    ),
    capitalAccountFlowHistory: Symbol("repo.capitalAccountFlowHistory"),
  },
  sdk: {
    ynab: Symbol("sdk.ynab"),
  },
};
