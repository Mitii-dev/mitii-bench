import { useEffect, useRef, useState } from "react";

export function useIntersectionObserver(targetRef) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const target = targetRef.current;

    if (!target || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (entry) {
        setIsIntersecting(entry.isIntersecting);
      }
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [targetRef]);

  return isIntersecting;
}

export function App() {
  const targetRef = useRef(null);
  const isIntersecting = useIntersectionObserver(targetRef);

  return (
    <main style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h1>Intersection Observer</h1>

      <p data-testid="intersection-status" role="status" aria-live="polite">
        {isIntersecting ? "Visible" : "Not visible"}
      </p>

      <section
        ref={targetRef}
        data-testid="observed-element"
        aria-label="Observed element"
        style={{
          minHeight: "120px",
          padding: "24px",
          border: "1px solid #888",
          borderRadius: "8px",
        }}
      >
        Viewport observation target
      </section>
    </main>
  );
}
