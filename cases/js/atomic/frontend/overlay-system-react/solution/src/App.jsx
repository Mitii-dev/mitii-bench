import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const nextId = (() => {
  let id = 0;
  return () => `overlay-${++id}`;
})();

function OverlayPanel({ item, index, close, open }) {
  const panelRef = useRef(null);
  const isModal = item.type === "dialog" || item.type === "drawer";

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const target = panel.querySelector(FOCUSABLE) || panel;
    target.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key !== "Tab" || !isModal) return;

    const elements = panelRef.current?.querySelectorAll(FOCUSABLE);
    const focusable = Array.from(elements || []);

    if (!focusable.length) {
      event.preventDefault();
      panelRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`overlay-backdrop ${item.type}`}
      data-testid={`${item.type}-backdrop`}
      style={{
        zIndex: 1000 + index * 10,
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && item.dismissOutside) {
          close(item.id);
        }
      }}
    >
      <section
        ref={panelRef}
        role={isModal ? "dialog" : "region"}
        aria-modal={isModal ? "true" : undefined}
        aria-labelledby={`${item.id}-title`}
        aria-label={item.title}
        tabIndex={-1}
        data-testid={
          item.type === "dialog" && item.nested ? "nested-dialog" : item.type
        }
        onKeyDown={handleKeyDown}
        className={`overlay-panel ${item.type}-panel`}
        style={{
          zIndex: 1001 + index * 10,
        }}
      >
        <header className="overlay-header">
          <h2 id={`${item.id}-title`}>{item.title}</h2>
          <button
            type="button"
            data-testid="close-overlay"
            aria-label={`Close ${item.title}`}
            onClick={() => close(item.id)}
          >
            ×
          </button>
        </header>

        <div className="overlay-content">
          {item.type === "dialog" && (
            <>
              <p>This dialog is managed by the centralized overlay system.</p>

              {!item.nested && (
                <button
                  type="button"
                  onClick={() =>
                    open({
                      type: "dialog",
                      title: "Nested dialog",
                      nested: true,
                    })
                  }
                >
                  Open nested dialog
                </button>
              )}
            </>
          )}

          {item.type === "drawer" && (
            <p>This drawer is displayed above the application content.</p>
          )}

          {item.type === "popover" && (
            <p>Contextual content displayed in a floating panel.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function OverlayManager({ children }) {
  const [stack, setStack] = useState([]);
  const [portalRoot, setPortalRoot] = useState(null);

  const stackRef = useRef([]);
  stackRef.current = stack;

  useEffect(() => {
    let root = document.querySelector('[data-testid="overlay-portal-root"]');

    const created = !root;

    if (!root) {
      root = document.createElement("div");
      root.dataset.testid = "overlay-portal-root";
      root.setAttribute("data-testid", "overlay-portal-root");
      document.body.appendChild(root);
    }

    setPortalRoot(root);

    return () => {
      if (created && root.parentNode) {
        root.remove();
      }
    };
  }, []);

  const open = useCallback((options) => {
    const item = {
      id: nextId(),
      dismissEscape: true,
      dismissOutside: true,
      ...options,
      trigger: document.activeElement,
    };

    setStack((previous) => [...previous, item]);
    return item.id;
  }, []);

  const close = useCallback((id) => {
    const current = stackRef.current;
    const item = current.find((entry) => entry.id === id);

    if (!item) return;

    const remaining = current.filter((entry) => entry.id !== id);

    setStack(remaining);

    requestAnimationFrame(() => {
      if (item.trigger?.isConnected) {
        item.trigger.focus();
      }
    });
  }, []);

  const closeAll = useCallback(() => {
    const current = stackRef.current;
    const first = current[0];

    setStack([]);

    requestAnimationFrame(() => {
      if (first?.trigger?.isConnected) {
        first.trigger.focus();
      }
    });
  }, []);

  // Escape is handled by the topmost overlay only.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      const top = stackRef.current.at(-1);

      if (!top || !top.dismissEscape) return;

      event.preventDefault();
      event.stopPropagation();
      close(top.id);
    };

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [close]);

  // Keep document scrolling locked while any modal remains active.
  useEffect(() => {
    const hasModal = stack.some(
      (item) => item.type === "dialog" || item.type === "drawer",
    );

    if (!hasModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [stack]);

  // Focus the newest modal when it becomes active.
  useEffect(() => {
    const top = stack.at(-1);

    if (!top) return;
    if (top.type !== "dialog" && top.type !== "drawer") return;

    const panel = portalRoot?.querySelector(
      `[data-testid="${top.nested ? "nested-dialog" : top.type}"]`,
    );

    const target = panel?.querySelector(FOCUSABLE) || panel;
    target?.focus();
  }, [stack, portalRoot]);

  const openDialog = () => open({ type: "dialog", title: "Dialog" });

  const openDrawer = () => open({ type: "drawer", title: "Drawer" });

  const openPopover = () => open({ type: "popover", title: "Popover" });

  return (
    <>
      {children({
        open,
        close,
        closeAll,
        openDialog,
        openDrawer,
        openPopover,
        stack,
      })}

      {portalRoot &&
        createPortal(
          stack.map((item, index) => (
            <OverlayPanel
              key={item.id}
              item={item}
              index={index}
              close={close}
              open={open}
            />
          )),
          portalRoot,
        )}
    </>
  );
}

export function App() {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipRoot, setTooltipRoot] = useState(null);

  useEffect(() => {
    const root = document.querySelector('[data-testid="overlay-portal-root"]');

    if (root) setTooltipRoot(root);
  }, []);

  return (
    <OverlayManager>
      {({ openDialog, openDrawer, openPopover, stack }) => (
        <main data-testid="overlay-system" style={styles.page}>
          <div style={styles.container}>
            <span style={styles.eyebrow}>INTERACTION PRIMITIVES</span>
            <h1>Overlay System</h1>
            <p style={styles.description}>
              A unified overlay experience with layered interactions, accessible
              focus management, and controlled dismissal.
            </p>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2>Overlay controls</h2>
                <span style={styles.counter}>{stack.length} active</span>
              </div>

              <div style={styles.actions}>
                <button
                  data-testid="open-dialog"
                  onClick={openDialog}
                  style={styles.primary}
                >
                  Open dialog
                </button>

                <button
                  data-testid="open-drawer"
                  onClick={openDrawer}
                  style={styles.secondary}
                >
                  Open drawer
                </button>

                <button
                  data-testid="open-popover"
                  onClick={openPopover}
                  style={styles.secondary}
                >
                  Open popover
                </button>
              </div>

              <div style={styles.tooltipArea}>
                <span>Keyboard and pointer interactions</span>
                <button
                  data-testid="tooltip-trigger"
                  aria-describedby={
                    tooltipVisible ? "overlay-tooltip" : undefined
                  }
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                  onFocus={() => setTooltipVisible(true)}
                  onBlur={() => setTooltipVisible(false)}
                  style={styles.infoButton}
                >
                  ?
                </button>
              </div>

              {tooltipVisible &&
                tooltipRoot &&
                createPortal(
                  <div
                    id="overlay-tooltip"
                    role="tooltip"
                    data-testid="tooltip"
                    style={styles.tooltip}
                  >
                    Helpful contextual information.
                  </div>,
                  tooltipRoot,
                )}
            </div>

            <div style={styles.status}>
              <span>Overlay stack</span>
              <strong>{stack.length}</strong>
            </div>

            <div style={styles.features}>
              {[
                "Centralized overlay management",
                "Nested stacking and independent dismissal",
                "Focus trapping and restoration",
                "Escape and outside-click handling",
                "Document scroll locking",
                "Portal lifecycle cleanup",
              ].map((feature) => (
                <div key={feature} style={styles.feature}>
                  <span>✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </OverlayManager>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1020",
    color: "#e8edf7",
    padding: "64px 24px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  eyebrow: {
    color: "#8e9bb8",
    fontSize: "11px",
    letterSpacing: "2px",
    fontWeight: 700,
  },
  description: {
    color: "#9ba8c0",
    lineHeight: 1.7,
    maxWidth: "560px",
  },
  card: {
    marginTop: "40px",
    padding: "28px",
    border: "1px solid #29334c",
    borderRadius: "16px",
    background: "#131b30",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  counter: {
    color: "#9ba8c0",
    fontSize: "13px",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  },
  primary: {
    background: "#a78bfa",
    color: "#171329",
    border: 0,
    borderRadius: "8px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondary: {
    background: "#222e48",
    color: "#e8edf7",
    border: "1px solid #3b4967",
    borderRadius: "8px",
    padding: "12px 18px",
    cursor: "pointer",
  },
  tooltipArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "28px",
    color: "#aab5ca",
    fontSize: "13px",
  },
  infoButton: {
    border: "1px solid #697a9c",
    borderRadius: "50%",
    background: "transparent",
    color: "#e8edf7",
    width: "26px",
    height: "26px",
    cursor: "pointer",
  },
  tooltip: {
    position: "fixed",
    zIndex: 10000,
    top: "150px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 14px",
    borderRadius: "8px",
    background: "#283550",
    color: "#fff",
    fontSize: "12px",
    pointerEvents: "none",
  },
  status: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 0",
    marginTop: "24px",
    borderBottom: "1px solid #29334c",
    color: "#aab5ca",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "24px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#aab5ca",
    fontSize: "13px",
  },
};
