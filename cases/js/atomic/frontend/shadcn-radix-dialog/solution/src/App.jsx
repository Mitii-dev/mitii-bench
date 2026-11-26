import * as Dialog from "@radix-ui/react-dialog";

export function App() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" data-testid="dialog-trigger">
          Open Dialog
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
          }}
        />

        <Dialog.Content
          data-testid="dialog-content"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(90%, 400px)",
            padding: "24px",
            background: "white",
            color: "#111",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <Dialog.Title>Profile Dialog</Dialog.Title>

          <Dialog.Description>
            View and manage your profile information.
          </Dialog.Description>

          <p>This is an accessible modal dialog.</p>

          <Dialog.Close asChild>
            <button type="button" data-testid="dialog-close">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
