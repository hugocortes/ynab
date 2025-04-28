import "reflect-metadata";
import { getRootContainer } from "./di/resolver.js";
import { YnabSdk } from "./infra/index.js";
import { singletons } from "./shared/index.js";
import { CapitalAccountFlow } from "./core/index.js";

(async () => {
  const container = await getRootContainer();

  const clazz = container.resolve<CapitalAccountFlow>(
    singletons.flow.capitalAccount
  );

  await clazz.creteCapitalAccounts();
  await clazz.createCapitalAccountFlowHistory();

  return 0;
})();
