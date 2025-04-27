import "reflect-metadata";
import { getRootContainer } from "./di/resolver.js";
import { YnabSdk } from "./infra/index.js";
import { singletons } from "./shared/index.js";
import { MoneyAccountFlow } from "./core/index.js";

(async () => {
  const container = await getRootContainer();

  const clazz = container.resolve<MoneyAccountFlow>(
    singletons.flow.moneyAccount
  );

  await clazz.creteMoneyAccounts();

  return 0;
})();
