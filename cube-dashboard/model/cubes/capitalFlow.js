cube("CapitalFlow", {
  sql_table: '"CapitalAccountFlowHistory"',
  sql_alias: "cafh",

  joins: {
    CapitalAccount: {
      relationship: "belongsTo",
      sql: `${CapitalFlow}."capitalAccountId" = ${CapitalAccount}."capitalAccountId"`,
    },
  },

  measures: {
    balance: {
      sql: '"amount"',
      type: "sum",
      rolling_window: {
        trailing: "unbounded",
        offset: "end",
      },
      format: "currency",
    },

    investmentContribution: {
      sql: `"amount"`,
      type: "sum",
      filters: [
        {
          sql: `${CapitalFlow}."type" = 'investmentContribution'`,
        },
      ],
      rolling_window: {
        trailing: "unbounded",
        offset: "end",
      },
      format: "currency",
    },
    monthAmount: {
      sql: '"amount"',
      type: "sum",
      rolling_window: {
        trailing: "1 month",
        offset: "end",
      },
      format: "currency",
    },
  },

  dimensions: {
    capitalAccountFlowHistoryId: {
      sql: '"capitalAccountFlowHistoryId"',
      type: "string",
      primaryKey: true,
    },

    capitalAccountId: {
      sql: '"capitalAccountId"',
      type: "string",
    },

    amount: {
      sql: '"amount"',
      type: "number",
      format: "currency",
    },

    date: {
      sql: '"date"',
      type: "time",
    },

    type: {
      sql: `${CapitalFlow}."type"`,
      type: "string",
    },
  },
});
