import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

function HomePage() {
  return <main data-testid="view-home">Home View</main>;
}

function DashboardPage() {
  return <main data-testid="view-dashboard">Dashboard View</main>;
}

export function App() {
  return (
    <BrowserRouter>
      <div>
        <nav aria-label="Main navigation">
          <Link to="/" data-testid="link-home">
            Home
          </Link>

          <Link to="/dashboard" data-testid="link-dashboard">
            Dashboard
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
