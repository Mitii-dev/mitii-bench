import Link from "next/link";
import { PHOTOS } from "./lib/photos";

export default function HomePage() {
  return (
    <main data-testid="photo-gallery" style={styles.container}>
      <header style={styles.header}>
        <h1>Explore Photos</h1>
        <p>Discover places and moments through photography.</p>
      </header>

      <section style={styles.grid}>
        {PHOTOS.map((photo) => (
          <article key={photo.id} style={styles.card}>
            <div
              aria-hidden="true"
              style={{
                ...styles.image,
                background: photo.background,
              }}
            >
              <span>{photo.location}</span>
            </div>

            <div style={styles.cardContent}>
              <h2>{photo.title}</h2>
              <p>{photo.description}</p>

              <Link
                href={`/photos/${photo.id}`}
                data-testid="photo-link"
                aria-label={`Open photo: ${photo.title}`}
                style={styles.link}
              >
                View photo
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  header: {
    marginBottom: "32px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  card: {
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#ffffff",
  },
  image: {
    height: "180px",
    display: "flex",
    alignItems: "flex-end",
    padding: "16px",
    color: "#ffffff",
    fontWeight: 600,
  },
  cardContent: {
    padding: "18px",
  },
  link: {
    display: "inline-block",
    marginTop: "8px",
    color: "#2563eb",
    fontWeight: 600,
    textDecoration: "none",
  },
};
