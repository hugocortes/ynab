import "reflect-metadata";
import { getRootContainer } from "./di/resolver.js";
import { YnabSdk } from "./infra/index.js";
import { singletons } from "./shared/index.js";

(async () => {
  const container = await getRootContainer();

  const sdk = container.resolve<YnabSdk>(singletons.sdk.ynab);

  console.log(sdk);

  return 0;
})();
