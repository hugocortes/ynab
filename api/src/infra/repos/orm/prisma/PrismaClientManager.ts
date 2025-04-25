import { PrismaClient, Prisma } from "@prisma/client";
import { ActiveTransactionContext } from "../../../../shared/index.js";
import { inject, injectable, singleton } from "tsyringe";

export type PrismaDB = PrismaClient;

@injectable()
@singleton()
export class PrismaClientManager {
  constructor(
    @inject(ActiveTransactionContext)
    private readonly activeTransactionContext: ActiveTransactionContext,
    @inject(PrismaClient) private readonly prisma: PrismaClient
  ) {}

  getClient(): Prisma.TransactionClient {
    return this.activeTransactionContext.context ?? this.prisma;
  }
}
