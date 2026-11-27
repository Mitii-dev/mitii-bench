import {
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

function ProductPage() {
  const { id } = useParams();

  return <main data-testid="product-detail">Product Details for ID: {id}</main>;
}

function HomePage() {
  return (
    <main>
      <h1>Products</h1>
      <Link to="/products/42" data-testid="product-link">
        View product 42
      </Link>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products/:id" element={<ProductPage />} />
    </Routes>
  );
}

export default App;
