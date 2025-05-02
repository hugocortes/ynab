import cubejs from "@cubejs-client/core";
import { QueryRenderer } from "@cubejs-client/react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import "./App.css";

const cube = cubejs(
  "33a135c62fa616ab9690b1865ffc256a4d6c94389acb4c99121fc71b85f463dd792165fa7a7a0f75df414705837d8730027e1fc542597e4508696b3adf90f6bc",
  {
    apiUrl: "http://localhost:4000/cubejs-api/v1",
  }
);

const dateRangeDefault = {
  granularity: "month",
  dateRange: "from 12/2013 to now",
};

const debtBalanceQuery = {
  measures: ["CapitalFlow.monthAmount"],
  timeDimensions: [
    {
      dimension: "CapitalFlow.date",
      ...dateRangeDefault,
    },
  ],
  filters: [
    {
      values: ["debt"],
      member: "CapitalAccount.type",
      operator: "equals" as const,
    },
  ],
  dimensions: ["CapitalAccount.name"],
};

const netWorthQuery = {
  measures: ["CapitalFlow.balance"],
  timeDimensions: [
    {
      dimension: "CapitalFlow.date",
      ...dateRangeDefault,
    },
  ],
  dimensions: ["CapitalAccount.type"],
};

const investmentBalanceQuery = {
  measures: ["CapitalFlow.balance"],
  timeDimensions: [
    {
      dimension: "CapitalFlow.date",
      ...dateRangeDefault,
    },
  ],
  filters: [
    {
      values: ["investment"],
      member: "CapitalAccount.type",
      operator: "equals" as const,
    },
  ],
  dimensions: ["CapitalAccount.name"],
};

const cashBalanceQuery = {
  measures: ["CapitalFlow.balance"],
  timeDimensions: [
    {
      dimension: "CapitalFlow.date",
      ...dateRangeDefault,
    },
  ],
  filters: [
    {
      values: ["cash"],
      member: "CapitalAccount.type",
      operator: "equals" as const,
    },
  ],
  dimensions: ["CapitalAccount.name"],
};

function currencyFormatter(amount: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return <span>{formatter.format(amount)}</span>;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function getMonthAmountRollup(
  rawSet: any[],
  nameKey: string,
  valueKey: string
) {
  const orderedNames = getOrderedNames(rawSet, nameKey);

  const data = rawSet.reduce((acc, row) => {
    if (!acc[row["CapitalFlow.date.month"]]) {
      acc[row["CapitalFlow.date.month"]] = {
        month: row["CapitalFlow.date.month"],
        columns: [],
      };
    }
    acc[row["CapitalFlow.date.month"]].columns.push(row);

    return acc;
  }, {} as { [K in string]: { month: string; columns: any[] } });

  Object.entries(data).forEach(([key, row]: [any, any], idx) => {
    orderedNames.map((name) => {
      let column = row.columns.find(
        (balance: any) => balance[nameKey] === name
      );
      if (!column) {
        column = {
          [nameKey]: name,
          [valueKey]: 0,
          "CapitalFlow.date.month": row.month,
        };
        row.columns.push(column);
      }

      row[name] = roundToHundredth(column[valueKey]);
      row.month = formatDate(row.month);
    });
  });

  return {
    data,
    orderedNames,
  };
}

function getOrderedNames(rawSet: any[], key: string) {
  const accountNames = new Set<string>();
  rawSet.forEach((row) => {
    if (row[key]) {
      accountNames.add(row[key]);
    }
  });
  const orderedNames = Array.from(accountNames).sort();

  return orderedNames;
}

function roundToHundredth(toRound: number) {
  return Math.round(toRound * 100) / 100;
}

const colors = [
  "#6B7280",
  "#A7B7A2",
  "#D1A7A0",
  "#B7A99A",
  "#7A9A95",
  "#B8B4C9",
  "#A68A7D",
  "#C8B7A0",
  "#5A6070",
  "#B0C4C0",
  "#D8A7B1",
  "#8F8F8F",
  "#8A9176",
  "#C9A8B9",
  "#7B8296",
  "#C2B280",
  "#666666",
  "#A8C4C6",
  "#B88A7F",
  "#9FB2A3",
];

function App() {
  return (
    <div className="App" style={{ padding: "50px" }}>
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <QueryRenderer
        query={[investmentBalanceQuery, cashBalanceQuery, netWorthQuery]}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const [balanceBreakdown, cashBreakdown, netWorthBreakdown] =
            resultSet.decompose();
          const balanceSet = balanceBreakdown.rawData();
          const cashSet = cashBreakdown.rawData();
          const netWorthSet = netWorthBreakdown.rawData();

          const { data, orderedNames: investmentNames } = getMonthAmountRollup(
            balanceSet,
            "CapitalAccount.name",
            "CapitalFlow.balance"
          );

          const { data: cashData, orderedNames: cashNames } =
            getMonthAmountRollup(
              cashSet,
              "CapitalAccount.name",
              "CapitalFlow.balance"
            );

          const { data: netWorthData, orderedNames: netWorthNames } =
            getMonthAmountRollup(
              netWorthSet,
              "CapitalAccount.type",
              "CapitalFlow.balance"
            );

          const mergedDataSet = Object.entries(data).map(
            ([key, row]: [any, any]) => {
              const netWorthRow = netWorthData[key];
              const { columns, month, ...rest } = netWorthRow;

              const cashRow = cashData[key];
              const { columns: cashColumns, ...restCash } = cashRow;

              const { columns: rowColumns, ...restRow } = row;

              const netWorthTotal = netWorthNames.reduce(
                (acc: number, name) => acc + netWorthRow[name],
                0
              );

              return {
                ...rest,
                ...restCash,
                ...restRow,
                netWorthTotal,
              };
            }
          );
          const orderedNames = [...cashNames, ...investmentNames];

          const allocationData = [...mergedDataSet].map((row) => {
            const clonedRow = { ...row };
            orderedNames.forEach((name) => {
              const column = clonedRow[name];

              clonedRow[name] = Math.round(
                roundToHundredth((column / (row.investment + row.cash)) * 100)
              );
            });
            return clonedRow;
          });

          return (
            <div>
              <ComposedChart
                width={1500}
                height={750}
                data={mergedDataSet}
                margin={{ left: 50 }}
              >
                <CartesianGrid strokeDasharray={"3 3"} />
                <XAxis dataKey="month" />
                <YAxis
                  domain={["dataMin - 1000", "dataMax + 50000"]}
                  tickMargin={0}
                />
                {orderedNames.map((name, idx) => {
                  return (
                    <Bar
                      key={name}
                      dataKey={name}
                      fill={colors[idx % colors.length]}
                      stackId="bar"
                    />
                  );
                })}
                {netWorthNames
                  .filter((name) => name !== "investment")
                  .map((name, idx) => {
                    return (
                      <Line
                        key={name}
                        dataKey={name}
                        stroke="#ff7300"
                        type="monotone"
                      />
                    );
                  })}
                <Line
                  key={"netWorthTotal"}
                  dataKey={"netWorthTotal"}
                  stroke="#ff7300"
                  type="monotone"
                />
                <Legend verticalAlign="bottom" height={36} />
              </ComposedChart>

              <br />
              <br />
              <br />

              <AreaChart
                width={1500}
                height={750}
                data={allocationData}
                margin={{ left: 50 }}
              >
                <CartesianGrid strokeDasharray={"3 3"} />
                <XAxis dataKey="month" />
                <YAxis domain={["0", "100"]} tickMargin={0} />
                {orderedNames.map((name, idx) => {
                  return (
                    <Area
                      key={name}
                      dataKey={name}
                      stroke={colors[idx % colors.length]}
                      fill={colors[idx % colors.length]}
                      stackId="bar"
                    />
                  );
                })}
                <Legend verticalAlign="bottom" height={36} />
              </AreaChart>
            </div>
          );
        }}
      />

      <br />
      <br />
      <br />

      <QueryRenderer
        query={cashBalanceQuery}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const rawSet = resultSet.rawData();
          const { data: ascData, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.balance"
          );
          const data = Object.values(ascData).reverse();

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={18}>
                        Cash Balances
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell key="Month">Month</TableCell>
                      {Array.from(orderedNames).map((name) => (
                        <TableCell key={name}>{name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any, idx) => {
                      return (
                        <TableRow hover key={idx}>
                          <TableCell key={row.month}>
                            {formatDate(row.month)}
                          </TableCell>

                          {orderedNames.map((name) => {
                            const column = row.columns.find(
                              (balance: any) =>
                                balance["CapitalAccount.name"] === name
                            );

                            return (
                              <TableCell key={name}>
                                {currencyFormatter(
                                  column["CapitalFlow.balance"]
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        }}
      />
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <QueryRenderer
        query={investmentBalanceQuery}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const rawSet = resultSet.rawData();
          const { data: ascData, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.balance"
          );
          const data = Object.values(ascData).reverse();

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={18}>
                        Investment Balances
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell key="Month">Month</TableCell>
                      {Array.from(orderedNames).map((name) => (
                        <TableCell key={name}>{name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any, idx) => {
                      return (
                        <TableRow hover key={idx}>
                          <TableCell key={row.month}>
                            {formatDate(row.month)}
                          </TableCell>

                          {orderedNames.map((name) => {
                            const column = row.columns.find(
                              (balance: any) =>
                                balance["CapitalAccount.name"] === name
                            );

                            return (
                              <TableCell key={name}>
                                {currencyFormatter(
                                  column["CapitalFlow.balance"]
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        }}
      />
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <div>HOUSE VALUE + HOUSE DEBT</div>
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <QueryRenderer
        query={debtBalanceQuery}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const rawSet = resultSet.rawData();
          const { data: ascData, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.monthAmount"
          );
          const data = Object.values(ascData).reverse();
          const first = Object.values(data)[0];

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={Object.keys(first as any).length}
                      >
                        Debt Balance
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell key="Month">Month</TableCell>
                      {Array.from(orderedNames).map((name) => (
                        <TableCell key={name}>{name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any, idx) => {
                      return (
                        <TableRow hover key={idx}>
                          <TableCell key={row.month}>
                            {formatDate(row.month)}
                          </TableCell>

                          {orderedNames.map((name) => {
                            const column = row.columns.find(
                              (column: any) =>
                                column["CapitalAccount.name"] === name
                            );

                            return (
                              <TableCell key={name}>
                                {currencyFormatter(
                                  column["CapitalFlow.monthAmount"]
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        }}
      />
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <QueryRenderer
        query={{
          measures: ["CapitalFlow.monthAmount"],
          timeDimensions: [
            {
              dimension: "CapitalFlow.date",
              granularity: "month",
              dateRange: "from 12/2013 to now",
            },
          ],
          filters: [
            {
              or: [
                {
                  and: [
                    {
                      values: ["investment"],
                      member: "CapitalAccount.type",
                      operator: "equals",
                    },
                    {
                      values: ["transfer"],
                      member: "CapitalFlow.type",
                      operator: "equals",
                    },
                  ],
                },
                {
                  and: [
                    {
                      values: ["saving"],
                      member: "CapitalAccount.name",
                      operator: "contains",
                    },
                    {
                      values: ["cash"],
                      member: "CapitalAccount.type",
                      operator: "equals",
                    },
                    {
                      values: ["transfer"],
                      member: "CapitalFlow.type",
                      operator: "equals",
                    },
                  ],
                },
              ],
            },
          ],
          dimensions: ["CapitalAccount.name"],
        }}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const rawSet = resultSet.rawData();
          const { data: ascData, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.monthAmount"
          );
          const data = Object.values(ascData).reverse();
          const first = Object.values(data)[0];

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={Object.keys(first as any).length}
                      >
                        Savings Contributions
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell key="Month">Month</TableCell>
                      {Array.from(orderedNames).map((name) => (
                        <TableCell key={name}>{name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any, idx) => {
                      return (
                        <TableRow hover key={idx}>
                          <TableCell key={row.month}>
                            {formatDate(row.month)}
                          </TableCell>

                          {orderedNames.map((name) => {
                            const column = row.columns.find(
                              (contribution: any) =>
                                contribution["CapitalAccount.name"] === name
                            );

                            return (
                              <TableCell key={name}>
                                {currencyFormatter(
                                  column["CapitalFlow.monthAmount"]
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        }}
      />
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <div>Asset Principal?</div>
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <QueryRenderer
        query={netWorthQuery}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }
          const rawSet = resultSet.rawData();

          const { data: ascData, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.type",
            "CapitalFlow.balance"
          );
          const data = Object.values(ascData).reverse();
          const first = data[0];

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={Object.keys(first as any).length + 3}
                      >
                        Net Worth Breakdown
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell key="Month">Month</TableCell>
                      {Array.from(orderedNames).map((name) => (
                        <TableCell key={name}>{name}</TableCell>
                      ))}
                      <TableCell key="total">Total</TableCell>
                      <TableCell key="delta">Delta</TableCell>
                      <TableCell key="deltaPercent">Delta %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any, idx, self) => {
                      return (
                        <TableRow hover key={idx}>
                          <TableCell key={row.month}>
                            {formatDate(row.month)}
                          </TableCell>

                          {orderedNames.map((name) => {
                            const column = row.columns.find(
                              (column: any) =>
                                column["CapitalAccount.type"] === name
                            );

                            return (
                              <TableCell key={name}>
                                {currencyFormatter(
                                  column["CapitalFlow.balance"]
                                )}
                              </TableCell>
                            );
                          })}

                          {
                            <TableCell key="total">
                              {currencyFormatter(
                                row.columns.reduce(
                                  (acc: number, row: any) =>
                                    acc + (row["CapitalFlow.balance"] || 0),
                                  0
                                )
                              )}
                            </TableCell>
                          }

                          {idx === self.length - 1 ? (
                            <TableCell key="delta">
                              {currencyFormatter(0)}
                            </TableCell>
                          ) : (
                            <TableCell key="delta">
                              {currencyFormatter(
                                row.columns.reduce(
                                  (acc: number, row: any) =>
                                    acc + (row["CapitalFlow.balance"] || 0),
                                  0
                                ) -
                                  (
                                    Object.values(data)[idx + 1] as any
                                  ).columns.reduce(
                                    (acc: number, row: any) =>
                                      acc + (row["CapitalFlow.balance"] || 0),
                                    0
                                  )
                              )}
                            </TableCell>
                          )}

                          {idx === self.length - 1 ? (
                            <TableCell key="deltaPercent">0%</TableCell>
                          ) : (
                            <TableCell key="deltaPercent">
                              {roundToHundredth(
                                ((row.columns.reduce(
                                  (acc: number, row: any) =>
                                    acc + (row["CapitalFlow.balance"] || 0),
                                  0
                                ) -
                                  (
                                    Object.values(data)[idx + 1] as any
                                  ).columns.reduce(
                                    (acc: number, row: any) =>
                                      acc + (row["CapitalFlow.balance"] || 0),
                                    0
                                  )) /
                                  row.columns.reduce(
                                    (acc: number, row: any) =>
                                      acc + (row["CapitalFlow.balance"] || 0),
                                    0
                                  )) *
                                  100
                              )}
                              %
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        }}
      />
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <QueryRenderer
        query={[
          {
            dimensions: ["CapitalAccount.name"],
            filters: [
              {
                or: [
                  {
                    values: ["investment"],
                    member: "CapitalAccount.type",
                    operator: "equals",
                  },
                ],
              },
            ],
            measures: ["CapitalFlow.balance", "CapitalFlow.contribution"],
            timeDimensions: [
              {
                dimension: "CapitalFlow.date",
                granularity: "month",
                dateRange: "from 12/2013 to now",
              },
            ],
          },
          {
            dimensions: ["CapitalAccount.name"],
            filters: [
              {
                or: [
                  {
                    and: [
                      {
                        values: ["saving"],
                        member: "CapitalAccount.name",
                        operator: "contains",
                      },
                      {
                        values: ["cash"],
                        member: "CapitalAccount.type",
                        operator: "equals",
                      },
                    ],
                  },
                ],
              },
            ],
            measures: ["CapitalFlow.interest"],
            timeDimensions: [
              {
                dimension: "CapitalFlow.date",
                granularity: "month",
                dateRange: "from 12/2013 to now",
              },
            ],
          },
        ]}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const [investmentBreakdown, interestBreakdown] =
            resultSet.decompose();

          const investmentSet = investmentBreakdown.rawData();
          const { data: ascInvestmentData, orderedNames: investmentNames } =
            getMonthAmountRollup(
              investmentSet,
              "CapitalAccount.name",
              "CapitalFlow.balance"
            );

          const interestSet = interestBreakdown.rawData();
          const { data: ascInterestData, orderedNames: interestNames } =
            getMonthAmountRollup(
              interestSet,
              "CapitalAccount.name",
              "CapitalFlow.interest"
            );

          const mergedDataSet = Object.entries(ascInvestmentData).map(
            ([key, row]: [any, any]) => {
              const interestRow = ascInterestData[key];
              const { columns, month, ...restInterest } = interestRow;

              const { columns: rowColumns, ...restRow } = row;

              return {
                ...restInterest,
                ...restRow,
                columns: [...rowColumns, ...columns],
              };
            }
          );
          const data = Object.values(mergedDataSet).reverse();
          const first = data[0];
          const orderedNames = [...investmentNames, ...interestNames];

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={Object.keys(first as any).length}
                      >
                        Savings Gains
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell key="Month">Month</TableCell>
                      {Array.from(orderedNames).map((name) => (
                        <TableCell key={name}>{name}</TableCell>
                      ))}
                      <TableCell key="Total">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any, idx) => {
                      return (
                        <TableRow hover key={idx}>
                          <TableCell key={row.month}>
                            {formatDate(row.month)}
                          </TableCell>

                          {orderedNames.map((name) => {
                            const column = row.columns.find(
                              (column: any) =>
                                column["CapitalAccount.name"] === name
                            );
                            if (name.includes("saving")) {
                              console.log(column);
                            }

                            if (!column) {
                              return (
                                <TableCell key={name}>
                                  {currencyFormatter(0)}
                                </TableCell>
                              );
                            }

                            if (column["CapitalFlow.interest"]) {
                              return (
                                <TableCell key={name}>
                                  {currencyFormatter(
                                    column["CapitalFlow.interest"]
                                  )}
                                </TableCell>
                              );
                            }

                            return (
                              <TableCell key={name}>
                                {column &&
                                column["CapitalFlow.balance"] - 0.001 > 0
                                  ? currencyFormatter(
                                      column["CapitalFlow.balance"] -
                                        (column["CapitalFlow.contribution"] ||
                                          0)
                                    )
                                  : currencyFormatter(0)}
                              </TableCell>
                            );
                          })}

                          <TableCell key="Total">
                            {currencyFormatter(
                              row.columns.reduce((acc: number, row: any) => {
                                if (row["CapitalFlow.balance"] < 0.1) {
                                  return acc;
                                }

                                if (
                                  Number.isFinite(row["CapitalFlow.interest"])
                                ) {
                                  return acc + row["CapitalFlow.interest"];
                                }
                                if (
                                  Number.isFinite(row["CapitalFlow.balance"])
                                ) {
                                  return (
                                    acc +
                                    (row["CapitalFlow.balance"] || 0) -
                                    row["CapitalFlow.contribution"]
                                  );
                                }

                                return acc;
                              }, 0)
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        }}
      />
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <div>Safe Withdrawal</div>
    </div>
  );
}

export default App;
