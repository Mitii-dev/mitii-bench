import useSWR from "swr";

const fetcher = async (symbol) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    symbol,
    price: Number((180 + Math.random() * 20).toFixed(2)),
    updatedAt: new Date().toLocaleTimeString(),
  };
};

export function App() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "AAPL",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return (
    <main>
      <h1>Stock Ticker</h1>

      <section>
        <h2>AAPL</h2>

        <p data-testid="stock-price">
          {isLoading
            ? "Loading stock price..."
            : data
              ? `$${data.price.toFixed(2)}`
              : "Price unavailable"}
        </p>

        <p data-testid="swr-validating">
          {isValidating ? "Updating..." : "Up to date"}
        </p>

        {error && <p role="alert">Unable to load stock price.</p>}

        {data && <p>Last updated: {data.updatedAt}</p>}

        <button type="button" onClick={() => mutate()}>
          Refresh Price
        </button>
      </section>

      <small>Demo stock data — simulated AAPL prices.</small>
    </main>
  );
}
