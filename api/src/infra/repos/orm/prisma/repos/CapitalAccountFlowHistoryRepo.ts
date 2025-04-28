import { inject, injectable, singleton } from "tsyringe";
import { PrismaClientManager } from "../PrismaClientManager.js";
import { CapitalAccountFlowHistoryRepoInput } from "../../../../ports/repo.js";
import { CapitalAccountFlowHistoryAttr } from "../../../../../models/index.js";

@injectable()
@singleton()
export class CapitalAccountFlowHistoryRepo {
  private readonly table = "capitalAccountFlowHistory";

  constructor(
    @inject(PrismaClientManager)
    private readonly prismaClientManager: PrismaClientManager
  ) {}

  async create(
    payload: CapitalAccountFlowHistoryRepoInput
  ): Promise<CapitalAccountFlowHistoryAttr> {
    const prisma = this.prismaClientManager.getClient();

    const row = await prisma[this.table].create({
      data: payload,
    });

    return row as CapitalAccountFlowHistoryAttr;
  }
}
