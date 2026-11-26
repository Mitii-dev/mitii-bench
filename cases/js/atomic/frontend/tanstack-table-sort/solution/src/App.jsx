import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const initialData = [
  { id: 1, name: "Charlie", email: "charlie@example.com", age: 28 },
  { id: 2, name: "Alice", email: "alice@example.com", age: 24 },
  { id: 3, name: "David", email: "david@example.com", age: 32 },
  { id: 4, name: "Bob", email: "bob@example.com", age: 26 },
  { id: 5, name: "Eve", email: "eve@example.com", age: 30 },
];

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
];

export function App() {
  const [data] = useState(() => initialData);
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  return (
    <main>
      <h1>Sortable Data Table</h1>

      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isNameColumn = header.column.id === "name";

                const sortDirection = header.column.getIsSorted();

                return (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : isNameColumn ? (
                      <button
                        type="button"
                        data-testid="sort-header-name"
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={`Sort by name ${
                          sortDirection === "asc" ? "descending" : "ascending"
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sortDirection === "asc"
                          ? " ▲"
                          : sortDirection === "desc"
                            ? " ▼"
                            : ""}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} data-testid={`table-row-${index}`}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{cell.getValue()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
