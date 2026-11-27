import {
  BrowserRouter,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  function handleQueryChange(event) {
    const value = event.target.value;
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set("q", value);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams, { replace: true });
  }

  return (
    <main>
      <h1>Search</h1>

      <label htmlFor="search-query">Search query</label>
      <input
        id="search-query"
        type="search"
        data-testid="query-input"
        value={query}
        onChange={handleQueryChange}
        placeholder="Enter a search term"
      />

      <p data-testid="search-results">Results for: {query}</p>
    </main>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="*" element={<SearchPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
