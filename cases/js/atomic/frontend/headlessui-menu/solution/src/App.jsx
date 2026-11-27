import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

export function App() {
  const options = ["Profile", "Settings", "Help", "Sign out"];

  return (
    <div style={{ padding: 40 }}>
      <Menu>
        <MenuButton
          data-testid="headless-menu-btn"
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "white",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Options
        </MenuButton>

        <MenuItems
          data-testid="headless-menu-items"
          anchor="bottom start"
          style={{
            marginTop: 8,
            padding: 6,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 8,
            minWidth: 160,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          {options.map((option) => (
            <MenuItem key={option}>
              {({ focus }) => (
                <button
                  type="button"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 10,
                    textAlign: "left",
                    border: 0,
                    borderRadius: 4,
                    background: focus ? "#e5e7eb" : "white",
                    cursor: "pointer",
                  }}
                >
                  {option}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
