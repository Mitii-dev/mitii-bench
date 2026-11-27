export const metadata = {
  title: "Photo Gallery",
  description: "A photo gallery with intercepting route modals.",
};

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body style={styles.body}>
        {children}
        {modal}
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    background: "#f8fafc",
    color: "#1e293b",
  },
};
