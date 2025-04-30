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

const balanceQuery = {
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
        query={[balanceQuery, netWorthQuery]}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const [balanceBreakdown, netWorthBreakdown] = resultSet.decompose();
          const balanceSet = balanceBreakdown.rawData();
          const netWorthSet = netWorthBreakdown.rawData();

          const { data, orderedNames } = getMonthAmountRollup(
            balanceSet,
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

              const { columns: rowColumns, ...restRow } = row;

              const netWorthTotal = netWorthNames.reduce(
                (acc: number, name) => acc + netWorthRow[name],
                0
              );

              return {
                ...rest,
                ...restRow,
                netWorthTotal,
              };
            }
          );

          const allocationData = [...mergedDataSet].map((row) => {
            const clonedRow = { ...row };
            orderedNames.forEach((name) => {
              const column = clonedRow[name];

              clonedRow[name] = roundToHundredth(
                (column / row.investment) * 100
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
      <div>----</div>
      <div>----</div>
      <div>----</div>
      <QueryRenderer
        query={balanceQuery}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const rawSet = resultSet.rawData();
          const { data, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.balance"
          );

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
                    {Object.values(data).map((row: any, idx) => {
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
          const { data, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.monthAmount"
          );

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={18}>
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
                    {Object.values(data).map((row: any, idx) => {
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
              values: ["investment"],
              member: "CapitalAccount.type",
              operator: "equals",
            },
            {
              values: ["investmentContribution"],
              member: "CapitalFlow.type",
              operator: "equals",
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
          const { data, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.monthAmount"
          );

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={18}>
                        Investment Contributions
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
                    {Object.values(data).map((row: any, idx) => {
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

          const { data, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.type",
            "CapitalFlow.balance"
          );

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={18}>
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
                    {Object.values(data).map((row: any, idx) => {
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

                          {idx === 0 ? (
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
                                    Object.values(data)[idx - 1] as any
                                  ).columns.reduce(
                                    (acc: number, row: any) =>
                                      acc + (row["CapitalFlow.balance"] || 0),
                                    0
                                  )
                              )}
                            </TableCell>
                          )}

                          {idx === 0 ? (
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
                                    Object.values(data)[idx - 1] as any
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
        query={{
          dimensions: ["CapitalAccount.name"],
          filters: [
            {
              values: ["investment"],
              member: "CapitalAccount.type",
              operator: "equals",
            },
          ],
          measures: [
            "CapitalFlow.balance",
            "CapitalFlow.investmentContribution",
          ],
          timeDimensions: [
            {
              dimension: "CapitalFlow.date",
              granularity: "month",
              dateRange: "from 12/2013 to now",
            },
          ],
        }}
        cubeApi={cube}
        render={({ resultSet }) => {
          if (!resultSet) {
            return "Loading Analytics...";
          }

          const rawSet = resultSet.rawData();
          const { data, orderedNames } = getMonthAmountRollup(
            rawSet,
            "CapitalAccount.name",
            "CapitalFlow.balance"
          );

          return (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 750 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" colSpan={18}>
                        Investment Gains
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
                    {Object.values(data).map((row: any, idx) => {
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
                                {column &&
                                column["CapitalFlow.balance"] - 0.1 > 0
                                  ? currencyFormatter(
                                      column["CapitalFlow.balance"] -
                                        (column[
                                          "CapitalFlow.investmentContribution"
                                        ] || 0)
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

                                acc +=
                                  (row["CapitalFlow.balance"] || 0) -
                                  row["CapitalFlow.investmentContribution"];

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
