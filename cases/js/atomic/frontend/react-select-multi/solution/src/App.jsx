import { useState } from "react";
import Select, { components } from "react-select";

const OPTIONS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "nextjs", label: "Next.js" },
  { value: "typescript", label: "TypeScript" },
];

function SearchInput(props) {
  return <components.Input {...props} data-testid="react-select-input" />;
}

export function App() {
  const [selectedOptions, setSelectedOptions] = useState([]);

  return (
    <main>
      <h1>Choose Technologies</h1>

      <Select
        isMulti
        isSearchable
        options={OPTIONS}
        value={selectedOptions}
        onChange={(newValue) => setSelectedOptions(newValue || [])}
        components={{ Input: SearchInput }}
        placeholder="Search and select technologies..."
        closeMenuOnSelect={false}
        aria-label="Select technologies"
      />

      <section>
        <h2>Selected values</h2>
        <div data-testid="selected-values">
          {selectedOptions.length === 0 ? (
            <span>No options selected</span>
          ) : (
            selectedOptions.map((option) => (
              <span key={option.value} data-testid="selected-tag">
                {option.label}
              </span>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
