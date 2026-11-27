import { forwardRef, useImperativeHandle, useRef } from "react";
import { FixedSizeList } from "react-window";

const ITEM_COUNT = 10000;
const ITEM_HEIGHT = 35;
const LIST_HEIGHT = 350;

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: index,
  name: `Item ${index + 1}`,
}));

function Row({ index, style }) {
  const item = items[index];

  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderBottom: "1px solid #e5e7eb",
        boxSizing: "border-box",
      }}
      data-testid={`virtual-row-${index}`}
    >
      {item.name}
    </div>
  );
}

export const App = forwardRef(function App(_, ref) {
  const listRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollTo: (offset) => listRef.current?.scrollTo(offset),
    scrollToItem: (index, align) => listRef.current?.scrollToItem(index, align),
  }));

  return (
    <main>
      <h1>Virtualized List</h1>
      <p>Showing 10,000 items efficiently.</p>

      <div
        data-testid="virtual-list"
        style={{
          width: "100%",
          maxWidth: "500px",
          height: LIST_HEIGHT,
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <FixedSizeList
          ref={listRef}
          height={LIST_HEIGHT}
          width="100%"
          itemCount={ITEM_COUNT}
          itemSize={ITEM_HEIGHT}
          overscanCount={2}
          itemKey={(index) => items[index].id}
        >
          {Row}
        </FixedSizeList>
      </div>
    </main>
  );
});
