/**
 * @description Timestamp reference.
 * createdAt indicates the time in which this resource was created.
 * updatedAt indicates the time in which this resource was last updated.
 * @api
 */
export type Timestamp = {
  /**
   * @description Time in which this resource was created
   */
  createdAt: Date;
  /**
   * @description Time in which this resource was last updated
   */
  updatedAt: Date;
};
