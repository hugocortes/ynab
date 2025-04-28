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
    contribution: {
      sql: '"amount"',
      type: "sum",
      filters: [
        {
          sql: `${CapitalFlow}.type = 'investmentContribution'`,
        },
      ],
      rolling_window: {
        trailing: "1 month",
        offset: "end",
      },
      format: "currency",
    },

    currentMonthAmount: {
      sql: '"amount"',
      type: "sum",
      rolling_window: {
        trailing: "1 month",
        offset: "end",
      },
    },
    previousMonthAmount: {
      sql: '"amount"',
      type: "sum",
      rolling_window: {
        trailing: "1 month",
        offset: "start",
      },
    },
    monthOverMonthAmount: {
      sql: `${CUBE.currentMonthAmount} / ${CUBE.previousMonthAmount}`,
      type: "number",
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
      sql: '"type"',
      type: "string",
    },
  },
});
