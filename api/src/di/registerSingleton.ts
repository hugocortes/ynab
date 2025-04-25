import { container } from "tsyringe";
import { singletons } from "../shared/index.js";
import { CashAccountRepo, YnabSdk } from "../infra/index.js";

type DIDecorator = {
  path: symbol;
  clazz: any;
};

const sdksToDecorate: DIDecorator[] = [
  {
    path: singletons.sdk.ynab,
    clazz: YnabSdk,
  },
];

const reposToDecorate: DIDecorator[] = [
  {
    path: singletons.repo.cashAccount,
    clazz: CashAccountRepo,
  },
];

export async function registerSingletons(rootContainer: typeof container) {
  sdksToDecorate.forEach((sdk) => {
    registerWithDecorator(rootContainer, sdk);
  });
  reposToDecorate.forEach((repo) => {
    registerWithDecorator(rootContainer, repo);
  });
}

function registerWithDecorator<T extends {}>(
  rootContainer: typeof container,
  di: DIDecorator
) {
  const instance = rootContainer.resolve<T>(di.clazz as any);

  rootContainer.register<T>(di.path, {
    useValue: instance,
  });
}
