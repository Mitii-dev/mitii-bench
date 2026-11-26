import { useState } from "react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        greeting: "Hello",
      },
    },
    es: {
      translation: {
        greeting: "Hola",
      },
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});

function Greeting() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      <h2>Language Selector</h2>

      <label htmlFor="language">Select Language</label>

      <select
        id="language"
        data-testid="lang-select"
        value={i18n.resolvedLanguage || i18n.language}
        onChange={handleLanguageChange}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>

      <h1 data-testid="translated-greeting">{t("greeting")}</h1>
    </main>
  );
}

export function App() {
  return <Greeting />;
}
