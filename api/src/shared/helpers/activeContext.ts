import { PrismaClient, Prisma } from "@prisma/client";
import { inject, injectable, singleton } from "tsyringe";
import { AsyncLocalStorage } from "node:async_hooks";

type ActiveContextArgs<T extends {}, F extends () => ReturnType<F>> =
  | [context: T, fn: F]
  | [fn: F];

abstract class ActiveContext<T extends {}> {
  protected storage = new AsyncLocalStorage<T>();

  get context() {
    return this.storage.getStore();
  }

  get requiredContext(): T {
    const context = this.context;
    if (!context) {
      throw new Error("no active context");
    }

    return context;
  }

  run<F extends () => ReturnType<F>>(
    ...args: ActiveContextArgs<T, F>
  ): ReturnType<F> {
    if (args.length === 1) {
      const [fn] = args;

      const context = this.context;
      if (!context) {
        return fn();
      }
      return this.storage.run(context, fn);
    }

    const [context, fn] = args;
    return this.storage.run(context, fn);
  }

  async runAsync<F extends () => ReturnType<F>>(
    ...args: ActiveContextArgs<T, F>
  ): Promise<ReturnType<F>> {
    if (args.length === 1) {
      const [fn] = args;
      return fn();
    }

    const [context, fn] = args;
    return this.storage.run(context, fn);
  }
}

@injectable()
@singleton()
export class ActiveTransactionContext extends ActiveContext<Prisma.TransactionClient> {
  constructor(@inject(PrismaClient) private readonly prisma: PrismaClient) {
    super();
  }

  run() {
    throw new Error("use runasync instead");
    return {} as any;
  }

  async runAsync<F extends () => ReturnType<F>>(
    ...args: ActiveContextArgs<Prisma.TransactionClient, F>
  ) {
    const prisma = this.context;

    const [context, fn] = args.length === 1 ? [null, args[0]] : args;

    if (prisma) {
      return context ? this.storage.run(context, fn) : fn();
    }
    // unsure how this case will happen
    if (!prisma && context) {
      return this.storage.run(context, fn);
    }

    return this.prisma.$transaction(
      async (prisma) => {
        return this.storage.run(prisma, fn);
      },
      {
        isolationLevel: "ReadCommitted",
        timeout: 2 * 60 * 1000, // need to do something to bring this down.
      }
    );
  }
}
