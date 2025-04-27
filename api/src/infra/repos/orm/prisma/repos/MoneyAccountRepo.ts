import { inject, injectable, singleton } from "tsyringe";
import { PrismaClientManager } from "../PrismaClientManager.js";
import { MoneyAccountCreateRepoInput } from "../../../../ports/repo.js";
import {
  MoneyAccountAttr,
  MoneyAccountQuery,
  MoneyAccountType,
  PaginationFilter,
} from "../../../../../models/index.js";

@injectable()
@singleton()
export class MoneyAccountRepo {
  private readonly table = "moneyAccount";

  constructor(
    @inject(PrismaClientManager)
    private readonly prismaClientManager: PrismaClientManager
  ) {}

  async find(
    filter: PaginationFilter<MoneyAccountQuery>
  ): Promise<MoneyAccountAttr[]> {
    const prisma = this.prismaClientManager.getClient();

    const { pagination, query } = filter;

    let where: Partial<MoneyAccountType> = {};
    if (query.type) {
      where.type = query.type;
    }

    const rows = await prisma[this.table].findMany({
      where,
    });

    return rows;
  }

  async create(
    payload: MoneyAccountCreateRepoInput
  ): Promise<MoneyAccountAttr> {
    const prisma = this.prismaClientManager.getClient();

    const row = await prisma[this.table].create({
      data: payload,
    });

    return row;
  }
}
