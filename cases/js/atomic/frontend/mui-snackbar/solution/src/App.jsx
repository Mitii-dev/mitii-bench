import { useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";

export function App() {
  const [open, setOpen] = useState(false);

  const handleClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <main style={{ padding: 32 }}>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        data-testid="show-alert-btn"
      >
        Show Notification
      </Button>

      <Snackbar
        open={open}
        onClose={handleClose}
        autoHideDuration={3000}
        data-testid="mui-snackbar"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Action Successful
        </Alert>
      </Snackbar>
    </main>
  );
}

export default App;
