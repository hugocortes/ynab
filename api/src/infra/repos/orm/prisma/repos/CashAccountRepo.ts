import { inject, injectable, singleton } from "tsyringe";
import { PrismaClientManager } from "../PrismaClientManager.js";
import { CashAccountCreateRepoInput } from "../../../../ports/repo.js";
import { CashAccountAttr } from "../../../../../models/index.js";

@injectable()
@singleton()
export class CashAccountRepo {
  private readonly table = "cashAccount";

  constructor(
    @inject(PrismaClientManager)
    private readonly prismaClientManager: PrismaClientManager
  ) {}

  async create(payload: CashAccountCreateRepoInput): Promise<CashAccountAttr> {
    const prisma = this.prismaClientManager.getClient();

    const row = await prisma[this.table].create({
      data: payload,
    });

    return row;
  }
}
