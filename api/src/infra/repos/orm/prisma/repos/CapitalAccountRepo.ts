import { inject, injectable, singleton } from "tsyringe";
import { PrismaClientManager } from "../PrismaClientManager.js";
import { CapitalAccountCreateRepoInput } from "../../../../ports/repo.js";
import {
  CapitalAccountAttr,
  CapitalAccountQuery,
  CapitalAccountType,
  PaginationFilter,
} from "../../../../../models/index.js";

@injectable()
@singleton()
export class CapitalAccountRepo {
  private readonly table = "capitalAccount";

  constructor(
    @inject(PrismaClientManager)
    private readonly prismaClientManager: PrismaClientManager
  ) {}

  async find(
    filter: PaginationFilter<CapitalAccountQuery>
  ): Promise<CapitalAccountAttr[]> {
    const prisma = this.prismaClientManager.getClient();

    const { pagination, query } = filter;

    let where: Partial<CapitalAccountType> = {};
    if (query.type) {
      where.type = query.type;
    }

    const rows = await prisma[this.table].findMany({
      where,
    });

    return rows;
  }

  async create(
    payload: CapitalAccountCreateRepoInput
  ): Promise<CapitalAccountAttr> {
    const prisma = this.prismaClientManager.getClient();

    const row = await prisma[this.table].create({
      data: payload,
    });

    return row;
  }
}
