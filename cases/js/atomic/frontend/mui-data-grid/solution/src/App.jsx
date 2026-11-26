import { useMemo, useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const rows = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", email: "bob@example.com" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
  { id: 4, name: "Diana Prince", email: "diana@example.com" },
  { id: 5, name: "Ethan Hunt", email: "ethan@example.com" },
  { id: 6, name: "Fiona Green", email: "fiona@example.com" },
  { id: 7, name: "George Wilson", email: "george@example.com" },
];

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
  { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
];

export function App() {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        row.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        User Records
      </Typography>

      <TextField
        fullWidth
        size="small"
        label="Search by name"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        // data-testid="grid-search" is applied to the native input below.
        slotProps={{
          htmlInput: {
            "data-testid": "grid-search",
          },
        }}
        sx={{ mb: 2 }}
      />

      <Box data-testid="mui-data-grid" sx={{ width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          autoHeight
          pagination
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
