cube("CapitalFlow", {
  sql_table: '"MoneyAccountCapitalFlowHistory"',
  sql_alias: "macfh",

  joins: {
    CapitalAccount: {
      relationship: "belongsTo",
      sql: `${CapitalFlow}."moneyAccountId" = ${CapitalAccount}."moneyAccountId"`,
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
    moneyAccountCapitalFlowHistoryId: {
      sql: '"moneyAccountCapitalFlowHistoryId"',
      type: "string",
      primaryKey: true,
    },

    moneyAccountId: {
      sql: '"moneyAccountId"',
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
