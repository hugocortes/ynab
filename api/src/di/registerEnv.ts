import { container } from "tsyringe";
import { env } from "../shared/index.js";
import { YnabConfig } from "../infra/index.js";

export async function registerEnv(rootContainer: typeof container) {
  rootContainer.register(env.nodeEnv, {
    useValue: "development",
  });
  rootContainer.register<YnabConfig>(env.provider.ynab, {
    useValue: {
      apiKey: "",
    },
  });
}
