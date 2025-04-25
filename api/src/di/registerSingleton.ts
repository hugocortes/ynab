import { container } from "tsyringe";
import { singletons } from "../shared/index.js";
import { YnabSdk } from "../infra/index.js";

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

export async function registerSingletons(rootContainer: typeof container) {
  sdksToDecorate.forEach((sdk) => {
    registerWithDecorator(rootContainer, sdk);
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
