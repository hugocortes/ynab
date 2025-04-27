import { inject, injectable, singleton } from "tsyringe";
import { PrismaClientManager } from "../PrismaClientManager.js";
import { MoneyAccountCapitalFlowHistoryRepoInput } from "../../../../ports/repo.js";
import { MoneyAccountCapitalFlowHistoryAttr } from "../../../../../models/index.js";

@injectable()
@singleton()
export class MoneyAccountCapitalFlowHistoryRepo {
  private readonly table = "moneyAccountCapitalFlowHistory";

  constructor(
    @inject(PrismaClientManager)
    private readonly prismaClientManager: PrismaClientManager
  ) {}

  async create(
    payload: MoneyAccountCapitalFlowHistoryRepoInput
  ): Promise<MoneyAccountCapitalFlowHistoryAttr> {
    const prisma = this.prismaClientManager.getClient();

    const row = await prisma[this.table].create({
      data: payload,
    });

    return row as MoneyAccountCapitalFlowHistoryAttr;
  }
}
