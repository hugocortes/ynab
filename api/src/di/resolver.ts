import { container } from "tsyringe";
import { env } from "../shared/index.js";
import { registerEnv } from "./registerEnv.js";
import { registerSingletons } from "./registerSingleton.js";

const rootContainer = container;

export async function getRootContainer() {
  try {
    rootContainer.resolve(env.nodeEnv);
  } catch (error) {
    await registerEnv(rootContainer);
    await registerSingletons(rootContainer);
  }
}
