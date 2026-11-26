import { atom, useAtom } from "jotai";

const countAtom = atom(0);

function ComponentA() {
  const [, setCount] = useAtom(countAtom);

  return (
    <button
      type="button"
      data-testid="atom-inc-btn"
      onClick={() => setCount((previous) => previous + 1)}
    >
      Increment
    </button>
  );
}

function ComponentB() {
  const [count] = useAtom(countAtom);

  return <p data-testid="atom-value-display">Count: {count}</p>;
}

export function App() {
  return (
    <main style={{ padding: 32 }}>
      <h2>Jotai Shared State</h2>
      <ComponentA />
      <ComponentB />
    </main>
  );
}
