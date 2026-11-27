import { useEffect, useMemo, useRef, useState } from "react";

const COMMANDS = [
  {
    id: "dashboard",
    label: "Go to Dashboard",
    description: "Open your overview",
    keywords: "home overview",
    action: "Dashboard opened",
  },
  {
    id: "settings",
    label: "Open Settings",
    description: "Manage application preferences",
    keywords: "preferences configuration",
    action: "Settings opened",
  },
  {
    id: "profile",
    label: "View Profile",
    description: "See your account details",
    keywords: "account user",
    action: "Profile opened",
  },
  {
    id: "help",
    label: "Get Help",
    description: "Find support and documentation",
    keywords: "support docs",
    action: "Help opened",
  },
  {
    id: "notifications",
    label: "View Notifications",
    description: "Review recent activity",
    keywords: "alerts activity",
    action: "Notifications opened",
  },
];

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastAction, setLastAction] = useState("");
  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return COMMANDS;
    return COMMANDS.filter((command) =>
      `${command.label} ${command.description} ${command.keywords}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setActiveIndex(0);
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const closePalette = () => setIsOpen(false);

  const executeCommand = (command) => {
    if (!command) return;
    setLastAction(command.action);
    closePalette();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        filteredCommands.length ? (index + 1) % filteredCommands.length : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        filteredCommands.length
          ? (index - 1 + filteredCommands.length) % filteredCommands.length
          : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      executeCommand(filteredCommands[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    }
  };

  return (
    <main className="app-shell">
      <section className="page-content" aria-labelledby="page-title">
        <p className="eyebrow">WORKSPACE</p>
        <h1 id="page-title">Welcome back</h1>
        <p>Use the command palette to quickly find an action.</p>
        <button
          ref={triggerRef}
          type="button"
          data-testid="command-palette-trigger"
          className="open-trigger"
          onClick={() => setIsOpen(true)}
        >
          Search commands <kbd>Ctrl K</kbd>
        </button>
        {lastAction && (
          <p
            data-testid="command-result"
            role="status"
            className="result-message"
          >
            {lastAction}
          </p>
        )}
      </section>

      {isOpen && (
        <div
          className="palette-backdrop"
          data-testid="command-palette-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePalette();
          }}
        >
          <section
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            data-testid="command-palette"
          >
            <div className="search-row">
              <span aria-hidden="true" className="search-icon">
                ⌕
              </span>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label="Search commands"
                aria-expanded="true"
                aria-controls="command-palette-options"
                aria-autocomplete="list"
                data-testid="command-palette-search"
                placeholder="Type a command or search..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <kbd>ESC</kbd>
            </div>

            <div className="results-heading">SUGGESTED COMMANDS</div>
            <ul
              id="command-palette-options"
              role="listbox"
              aria-label="Commands"
              data-testid="command-palette-options"
            >
              {filteredCommands.map((command, index) => (
                <li key={command.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    data-testid={`command-option-${command.id}`}
                    className={`command-option ${index === activeIndex ? "is-active" : ""}`}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => executeCommand(command)}
                  >
                    <span className="command-mark" aria-hidden="true">
                      ↗
                    </span>
                    <span className="command-copy">
                      <strong>{command.label}</strong>
                      <small>{command.description}</small>
                    </span>
                    {index === activeIndex && <kbd>↵</kbd>}
                  </button>
                </li>
              ))}
            </ul>

            {filteredCommands.length === 0 && (
              <p className="empty-state" data-testid="command-palette-empty">
                No commands found. Try a different search.
              </p>
            )}

            <footer className="palette-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> to navigate
              </span>
              <span>
                <kbd>↵</kbd> to select
              </span>
              <span>
                <kbd>ESC</kbd> to close
              </span>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
