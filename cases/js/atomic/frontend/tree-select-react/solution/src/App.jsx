import { useEffect, useRef, useState } from "react";

const TREE = [
  {
    id: "engineering",
    label: "Engineering",
    children: [
      {
        id: "frontend",
        label: "Frontend",
        children: [
          { id: "react", label: "React" },
          { id: "vue", label: "Vue" },
        ],
      },
      {
        id: "backend",
        label: "Backend",
        children: [
          { id: "node", label: "Node.js" },
          { id: "python", label: "Python" },
        ],
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    children: [
      { id: "product-design", label: "Product Design" },
      { id: "ux-research", label: "UX Research" },
    ],
  },
];

function getLeafIds(node) {
  if (!node.children?.length) return [node.id];
  return node.children.flatMap(getLeafIds);
}

function getLeaves(nodes) {
  return nodes.flatMap((node) =>
    node.children ? getLeaves(node.children) : [node],
  );
}

function TreeNode({ node, selected, expandedIds, onToggle, onExpand }) {
  const checkboxRef = useRef(null);
  const leafIds = getLeafIds(node);
  const selectedCount = leafIds.filter((id) => selected.has(id)).length;
  const checked = selectedCount === leafIds.length;
  const indeterminate = selectedCount > 0 && selectedCount < leafIds.length;
  const hasChildren = Boolean(node.children?.length);
  const expanded = expandedIds.has(node.id);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <li data-testid="tree-node">
      <div style={styles.nodeRow}>
        {hasChildren ? (
          <button
            type="button"
            data-testid="expand-button"
            aria-label={`${expanded ? "Collapse" : "Expand"} ${node.label}`}
            aria-expanded={expanded}
            onClick={() => onExpand(node.id)}
            style={styles.expandButton}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span style={styles.expandPlaceholder} />
        )}

        <label style={styles.checkboxLabel}>
          <input
            ref={checkboxRef}
            type="checkbox"
            data-testid="tree-checkbox"
            checked={checked}
            onChange={() => onToggle(leafIds, checked)}
          />
          {node.label}
        </label>
      </div>

      {hasChildren && expanded && (
        <ul style={styles.children}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selected={selected}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onExpand={onExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function App() {
  const [selected, setSelected] = useState(() => new Set());
  const [expandedIds, setExpandedIds] = useState(
    () => new Set(["engineering", "design", "frontend", "backend"]),
  );

  const leaves = getLeaves(TREE);
  const selectedLeaves = leaves.filter((leaf) => selected.has(leaf.id));

  const toggleSelection = (leafIds, currentlyChecked) => {
    setSelected((previous) => {
      const next = new Set(previous);

      leafIds.forEach((id) => {
        if (currentlyChecked) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });

      return next;
    });
  };

  const toggleExpanded = (id) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return (
    <main data-testid="tree-select" style={styles.container}>
      <h1>Team Selection</h1>
      <p>Select teams or individual areas from the hierarchy.</p>

      <section style={styles.panel}>
        <h2>Available Teams</h2>

        <ul style={styles.tree}>
          {TREE.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selected={selected}
              expandedIds={expandedIds}
              onToggle={toggleSelection}
              onExpand={toggleExpanded}
            />
          ))}
        </ul>
      </section>

      <section
        data-testid="selection-summary"
        style={styles.panel}
        aria-live="polite"
      >
        <div style={styles.summaryHeader}>
          <div>
            <h2>Selected Items</h2>
            <p>{selectedLeaves.length} selected</p>
          </div>

          <button
            type="button"
            data-testid="clear-selection"
            onClick={() => setSelected(new Set())}
            disabled={selectedLeaves.length === 0}
            style={styles.clearButton}
          >
            Clear All
          </button>
        </div>

        {selectedLeaves.length === 0 ? (
          <p>No items selected.</p>
        ) : (
          <ul style={styles.selectedList}>
            {selectedLeaves.map((leaf) => (
              <li
                key={leaf.id}
                data-testid="selected-item"
                style={styles.selectedItem}
              >
                {leaf.label}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "760px",
    margin: "40px auto",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
  },
  panel: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "20px",
  },
  tree: {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0,
  },
  children: {
    listStyle: "none",
    paddingLeft: "28px",
    margin: "8px 0",
  },
  nodeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "36px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  expandButton: {
    width: "24px",
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
  },
  expandPlaceholder: {
    display: "inline-block",
    width: "24px",
  },
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  clearButton: {
    padding: "8px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },
  selectedList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    listStyle: "none",
    padding: 0,
  },
  selectedItem: {
    padding: "6px 10px",
    borderRadius: "6px",
    background: "#eff6ff",
  },
};
