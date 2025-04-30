cube("CapitalAccount", {
  sql_table: '"CapitalAccount"',
  sql_alias: "ca",

  measures: {
    count: {
      sql: '"capitalAccountId"',
      type: "count",
    },
  },

  dimensions: {
    capitalAccountId: {
      sql: '"capitalAccountId"',
      type: "string",
      primaryKey: true,
    },

    externalId: {
      sql: '"externalId"',
      type: "string",
    },
    name: {
      sql: '"name"',
      type: "string",
    },
    type: {
      sql: `${CapitalAccount}."type"`,
      type: "string",
    },
  },
});
