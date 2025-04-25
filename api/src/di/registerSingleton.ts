import { container } from "tsyringe";
import { singletons } from "../shared/index.js";
import { CashAccountRepo, YnabSdk } from "../infra/index.js";
import { CashAccountFlow } from "../core/index.js";
import { PrismaClient } from "@prisma/client";

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

const flowsToDecorate: DIDecorator[] = [
  {
    path: singletons.flow.cashAccount,
    clazz: CashAccountFlow,
  },
];

export async function registerSingletons(rootContainer: typeof container) {
  const prisma = new PrismaClient();
  rootContainer.registerInstance(PrismaClient, prisma);

  sdksToDecorate.forEach((sdk) => {
    registerWithDecorator(rootContainer, sdk);
  });
  reposToDecorate.forEach((repo) => {
    registerWithDecorator(rootContainer, repo);
  });
  flowsToDecorate.forEach((flow) => {
    registerWithDecorator(rootContainer, flow);
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
