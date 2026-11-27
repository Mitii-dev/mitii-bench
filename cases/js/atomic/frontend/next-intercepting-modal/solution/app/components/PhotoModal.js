"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PhotoModal({ photo }) {
  const router = useRouter();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousActiveElement = document.activeElement;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [router]);

  return (
    <div style={styles.overlay}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-modal-title"
        data-testid="photo-modal"
        style={styles.modal}
      >
        <button
          ref={closeButtonRef}
          type="button"
          data-testid="close-modal"
          aria-label="Close photo dialog"
          onClick={() => router.back()}
          style={styles.closeButton}
        >
          Close
        </button>

        <div
          aria-hidden="true"
          style={{
            ...styles.image,
            background: photo.background,
          }}
        >
          {photo.location}
        </div>

        <h2 id="photo-modal-title">{photo.title}</h2>
        <p>{photo.description}</p>
        <p>
          <strong>Location:</strong> {photo.location}
        </p>
      </section>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(15, 23, 42, 0.65)",
  },
  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "560px",
    padding: "24px",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#1e293b",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  closeButton: {
    display: "block",
    marginLeft: "auto",
    marginBottom: "16px",
    padding: "8px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    background: "#ffffff",
    cursor: "pointer",
  },
  image: {
    height: "220px",
    display: "flex",
    alignItems: "flex-end",
    padding: "18px",
    borderRadius: "8px",
    color: "#ffffff",
    fontWeight: 600,
  },
};
