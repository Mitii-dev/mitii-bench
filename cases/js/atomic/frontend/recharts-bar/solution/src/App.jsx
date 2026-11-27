import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartData = {
  Monthly: [
    { label: "Jan", value: 120 },
    { label: "Feb", value: 180 },
    { label: "Mar", value: 150 },
    { label: "Apr", value: 220 },
    { label: "May", value: 190 },
    { label: "Jun", value: 260 },
  ],
  Yearly: [
    { label: "2021", value: 1400 },
    { label: "2022", value: 1850 },
    { label: "2023", value: 2100 },
    { label: "2024", value: 2450 },
    { label: "2025", value: 2800 },
  ],
};

export function App() {
  const [filter, setFilter] = useState("Monthly");
  const data = chartData[filter];

  return (
    <main>
      <h1>Performance Overview</h1>

      <label htmlFor="chart-filter">Time period</label>
      <select
        id="chart-filter"
        data-testid="chart-filter"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      >
        <option value="Monthly">Monthly</option>
        <option value="Yearly">Yearly</option>
      </select>

      <section
        data-testid="recharts-wrapper"
        aria-label={`${filter} performance bar chart`}
        style={{ width: "100%", height: 320, minWidth: 0 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" name="Performance" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <p data-testid="chart-data-summary">
        {filter} data:{" "}
        {data.map((item) => `${item.label}: ${item.value}`).join(", ")}
      </p>
    </main>
  );
}

export default App;
