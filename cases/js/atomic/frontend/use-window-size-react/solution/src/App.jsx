import { useEffect, useState } from "react";

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}

export function App() {
  const { width, height } = useWindowSize();

  return (
    <main
      data-testid="window-size"
      style={{
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Window Size</h1>

      <p>
        Width: <span data-testid="window-width">{width}</span> px
      </p>

      <p>
        Height: <span data-testid="window-height">{height}</span> px
      </p>
    </main>
  );
}
