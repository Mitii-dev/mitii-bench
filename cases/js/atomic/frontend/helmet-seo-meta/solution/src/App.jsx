import { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

function SeoManager() {
  const [title, setTitle] = useState("My Website");
  const [description, setDescription] = useState("Welcome to my website.");

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>

      <main style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
        <h2>SEO Metadata Manager</h2>

        <div>
          <label htmlFor="seo-title">Page Title</label>
          <input
            id="seo-title"
            data-testid="seo-title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter page title"
          />
        </div>

        <div>
          <label htmlFor="seo-description">Meta Description</label>
          <textarea
            id="seo-description"
            data-testid="seo-description-input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter page description"
          />
        </div>
      </main>
    </>
  );
}

export function App() {
  return (
    <HelmetProvider>
      <SeoManager />
    </HelmetProvider>
  );
}
