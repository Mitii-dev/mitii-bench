import { useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

export function RequireAuth({ isAuthenticated }) {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  function handleLogin() {
    onLogin();
    navigate("/dashboard");
  }

  return (
    <main data-testid="login-view">
      <h1>Login</h1>
      <p>You must log in to view this page.</p>
      <button type="button" onClick={handleLogin}>
        Log in
      </button>
    </main>
  );
}

function ProtectedPage({ onLogout }) {
  return (
    <main data-testid="protected-view">
      <h1>Protected Dashboard</h1>
      <p>You are authenticated.</p>
      <button type="button" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}

export function AppRoutes({ isAuthenticated, onLogin, onLogout }) {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={onLogin} />} />

      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
        <Route
          path="/dashboard"
          element={<ProtectedPage onLogout={onLogout} />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        onLogin={() => setIsAuthenticated(true)}
        onLogout={() => setIsAuthenticated(false)}
      />
    </BrowserRouter>
  );
}

export default App;
