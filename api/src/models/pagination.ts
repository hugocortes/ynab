/**
 * @description Offset pagination query object for paginated APIs.
 * @api
 */
export type OffsetPagination = {
  /**
   * @description Current pagination limit
   * @minimum 0
   * @maximum 1000
   */
  limit: number;
  /**
   * @description Current pagination page
   * @minimum 1
   */
  page: number;
};

/**
 * @description In a few cases, we allow a full query against all resources
 * without pagination. For those cases, we use an empty object.
 * @api
 */
export type PaginationXOR = {} | OffsetPagination;

export type PaginationFilter<T> = { query: T; pagination: PaginationXOR };
