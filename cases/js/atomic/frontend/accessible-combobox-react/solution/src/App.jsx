import { useMemo, useState } from "react";

const OPTIONS = [
  { id: "react", label: "React" },
  { id: "angular", label: "Angular" },
  { id: "vue", label: "Vue" },
  { id: "svelte", label: "Svelte" },
  { id: "solid", label: "SolidJS" },
  { id: "next", label: "Next.js" },
];

const LISTBOX_ID = "combobox-options";

export function App() {
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return OPTIONS;
    }

    return OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const activeOption = filteredOptions[activeIndex];

  function openListbox() {
    setIsOpen(true);
  }

  function closeListbox() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectOption(option) {
    setSelectedValue(option.label);
    setQuery(option.label);
    closeListbox();
  }

  function handleInputChange(event) {
    setQuery(event.target.value);
    setActiveIndex(-1);
    setIsOpen(true);
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();

        if (!isOpen) {
          openListbox();
          setActiveIndex(0);
          return;
        }

        setActiveIndex((current) => {
          if (filteredOptions.length === 0) return -1;
          return Math.min(current + 1, filteredOptions.length - 1);
        });
        break;
      }

      case "ArrowUp": {
        event.preventDefault();

        if (!isOpen) {
          openListbox();
          setActiveIndex(filteredOptions.length - 1);
          return;
        }

        setActiveIndex((current) => {
          if (filteredOptions.length === 0) return -1;
          return current <= 0 ? 0 : current - 1;
        });
        break;
      }

      case "Home": {
        if (isOpen && filteredOptions.length > 0) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      }

      case "End": {
        if (isOpen && filteredOptions.length > 0) {
          event.preventDefault();
          setActiveIndex(filteredOptions.length - 1);
        }
        break;
      }

      case "Enter": {
        if (isOpen && activeOption) {
          event.preventDefault();
          selectOption(activeOption);
        }
        break;
      }

      case "Escape": {
        if (isOpen) {
          event.preventDefault();
          closeListbox();
        }
        break;
      }

      case "Tab": {
        closeListbox();
        break;
      }

      default:
        break;
    }
  }

  const styles = {
    container: {
      maxWidth: "480px",
      margin: "60px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#1f2937",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: 600,
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      border: "1px solid #9ca3af",
      borderRadius: "6px",
      fontSize: "16px",
    },
    listbox: {
      marginTop: "4px",
      padding: "4px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      background: "#ffffff",
      listStyle: "none",
    },
    option: {
      padding: "10px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    activeOption: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    empty: {
      padding: "12px",
      color: "#6b7280",
    },
    selected: {
      marginTop: "20px",
      color: "#374151",
    },
  };

  return (
    <main style={styles.container}>
      <h1>Accessible Combobox</h1>

      <label htmlFor="technology-combobox" style={styles.label}>
        Select a technology
      </label>

      <input
        id="technology-combobox"
        data-testid="accessible-combobox"
        type="text"
        role="combobox"
        value={query}
        placeholder="Search technologies..."
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={LISTBOX_ID}
        aria-activedescendant={
          isOpen && activeOption
            ? `combobox-option-${activeOption.id}`
            : undefined
        }
        onChange={handleInputChange}
        onFocus={openListbox}
        onKeyDown={handleKeyDown}
        style={styles.input}
      />

      {isOpen && (
        <ul
          id={LISTBOX_ID}
          role="listbox"
          data-testid="combobox-listbox"
          aria-label="Available technologies"
          style={styles.listbox}
        >
          {filteredOptions.length === 0 ? (
            <li data-testid="combobox-empty-state" style={styles.empty}>
              No matching options found.
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.id}
                id={`combobox-option-${option.id}`}
                data-testid={`combobox-option-${option.id}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                style={{
                  ...styles.option,
                  ...(index === activeIndex ? styles.activeOption : {}),
                }}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}

      <p
        data-testid="selected-value"
        style={styles.selected}
        aria-live="polite"
      >
        Selected: {selectedValue || "None"}
      </p>
    </main>
  );
}

export default App;
