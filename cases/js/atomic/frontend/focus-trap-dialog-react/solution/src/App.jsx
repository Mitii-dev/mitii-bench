import { useState } from "react";
import FocusTrap from "focus-trap-react";
import "./App.css";

export function App() {
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    closeDialog();
  };

  return (
    <div className="app">
      <main className="page-content" inert={isOpen ? "" : undefined}>
        <div className="content-card">
          <span className="eyebrow">ACCESSIBILITY DEMO</span>

          <h1>Focus Management</h1>

          <p>
            Explore an accessible modal dialog with keyboard focus management.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => setIsOpen(true)}
            data-testid="open-dialog"
          >
            Open Dialog
          </button>
        </div>
      </main>

      {isOpen && (
        <div className="modal-overlay" data-testid="dialog-overlay">
          <FocusTrap
            focusTrapOptions={{
              initialFocus: "#dialog-title",
              fallbackFocus: "#accessible-dialog",
              returnFocusOnDeactivate: true,
              escapeDeactivates: true,
              clickOutsideDeactivates: false,
              tabbableOptions: {
                displayCheck: "none",
              },
              onDeactivate: closeDialog,
            }}
          >
            <section
              id="accessible-dialog"
              className="dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
              data-testid="dialog"
              tabIndex={-1}
            >
              <button
                type="button"
                className="icon-button"
                aria-label="Close dialog"
                onClick={closeDialog}
                data-testid="close-dialog"
              >
                ×
              </button>

              <span className="eyebrow">MODAL WINDOW</span>

              <h2 id="dialog-title" tabIndex={-1}>
                Welcome aboard
              </h2>

              <p id="dialog-description">
                Enter your details below to continue.
              </p>

              <form onSubmit={handleSubmit}>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  data-testid="name-input"
                />

                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  data-testid="email-input"
                />

                <button type="button" disabled>
                  Disabled action
                </button>

                <div className="dialog-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeDialog}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primary-button">
                    Save
                  </button>
                </div>
              </form>
            </section>
          </FocusTrap>
        </div>
      )}
    </div>
  );
}
