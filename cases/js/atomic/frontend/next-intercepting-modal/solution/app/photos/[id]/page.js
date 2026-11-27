import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhotoById } from "../../lib/photos";

export default async function PhotoDetailPage({ params }) {
  const { id } = await params;
  const photo = getPhotoById(id);

  if (!photo) {
    notFound();
  }

  return (
    <main data-testid="photo-detail-page" style={styles.container}>
      <Link href="/" style={styles.backLink}>
        Back to gallery
      </Link>

      <article style={styles.card}>
        <div
          aria-hidden="true"
          style={{
            ...styles.image,
            background: photo.background,
          }}
        >
          {photo.location}
        </div>

        <div style={styles.content}>
          <h1>{photo.title}</h1>
          <p>{photo.description}</p>
          <p>
            <strong>Location:</strong> {photo.location}
          </p>
        </div>
      </article>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  backLink: {
    display: "inline-block",
    marginBottom: "24px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
  card: {
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#ffffff",
  },
  image: {
    height: "320px",
    display: "flex",
    alignItems: "flex-end",
    padding: "24px",
    color: "#ffffff",
    fontWeight: 600,
  },
  content: {
    padding: "24px",
  },
};
