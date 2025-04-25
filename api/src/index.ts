import "reflect-metadata";
import { getRootContainer } from "./di/resolver.js";
import { YnabSdk } from "./infra/index.js";
import { singletons } from "./shared/index.js";
import { CashAccountFlow } from "./core/index.js";

(async () => {
  const container = await getRootContainer();

  const clazz = container.resolve<CashAccountFlow>(singletons.flow.cashAccount);

  await clazz.creteCashAccounts();

  return 0;
})();
