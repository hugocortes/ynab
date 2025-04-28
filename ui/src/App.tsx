import React from "react";
import cubejs from "@cubejs-client/core";
import { QueryRenderer } from "@cubejs-client/react";
import { ResponsiveContainer } from "recharts";
import "./App.css";

const cube = cubejs(
  "33a135c62fa616ab9690b1865ffc256a4d6c94389acb4c99121fc71b85f463dd792165fa7a7a0f75df414705837d8730027e1fc542597e4508696b3adf90f6bc",
  {
    apiUrl: "http://localhost:4000/cubejs-api/v1",
  }
);

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

function App() {
  return (
    <div className="App">
      <ResponsiveContainer width="100%" height="100%">
        <QueryRenderer
          query={{
            measures: ["CapitalFlow.contribution"],
            timeDimensions: [
              {
                dimension: "CapitalFlow.date",
                granularity: "month",
                dateRange: "from 12/2013 to now",
              },
            ],
            filters: [],
            dimensions: ["CapitalAccount.name"],
          }}
          cubeApi={cube}
          render={({ resultSet }) => {
            if (!resultSet) {
              return "Loading Analytics...";
            }

            const rawSet = resultSet.rawData();

            const accountNames = new Set<string>();
            rawSet.forEach((row) => {
              if (row["CapitalAccount.name"]) {
                accountNames.add(row["CapitalAccount.name"]);
              }
            });
            const orderedNames = Array.from(accountNames).sort();

            let totals: { [K in string]: { name: string; amount: number } } =
              {};
            const data = rawSet.reduce((acc, row) => {
              if (!acc[row["CapitalFlow.date.month"]]) {
                acc[row["CapitalFlow.date.month"]] = {
                  month: row["CapitalFlow.date.month"],
                  contributions: [],
                };
              }
              acc[row["CapitalFlow.date.month"]].contributions.push(row);

              if (row["CapitalAccount.name"]) {
                if (!totals[row["CapitalAccount.name"]]) {
                  totals[row["CapitalAccount.name"]] = {
                    name: row["CapitalAccount.name"],
                    amount: 0,
                  };
                }
                totals[row["CapitalAccount.name"]].amount +=
                  row["CapitalFlow.contribution"] || 0;
              }

              return acc;
            }, {} as { [K in string]: { month: string; contributions: any[] } });

            return (
              <table>
                <thead>
                  <tr>
                    <th key="Month">Month</th>
                    {Array.from(orderedNames).map((name) => (
                      <th key={name}>{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(data).map((row: any, idx) => {
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td key={row.month}>{formatDate(row.month)}</td>

                        {orderedNames.map((name) => {
                          const contribution = row.contributions.find(
                            (contribution: any) =>
                              contribution["CapitalAccount.name"] === name
                          );

                          return (
                            <td key={name}>
                              {contribution &&
                              contribution["CapitalFlow.contribution"]
                                ? currencyFormatter(
                                    contribution["CapitalFlow.contribution"]
                                  )
                                : currencyFormatter(0)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr key="total" className="highlighted">
                    <td key="total">Total</td>
                    {orderedNames.map((name) => {
                      const contribution = totals[name];

                      return (
                        <td key={name}>
                          {contribution
                            ? currencyFormatter(contribution.amount)
                            : currencyFormatter(0)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            );
          }}
        />
      </ResponsiveContainer>
    </div>
  );
}

export default App;
