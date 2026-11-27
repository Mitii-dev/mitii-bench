import { useState } from "react";

const locationData = {
  India: {
    Karnataka: ["Bengaluru", "Mysuru"],
    Maharashtra: ["Mumbai", "Pune"],
  },
  "United States": {
    California: ["Los Angeles", "San Francisco"],
    Texas: ["Austin", "Dallas"],
  },
  Canada: {
    Ontario: ["Toronto", "Ottawa"],
    Quebec: ["Montreal", "Quebec City"],
  },
};

export function App() {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const availableStates = country ? Object.keys(locationData[country]) : [];

  const availableCities =
    country && state ? (locationData[country][state] ?? []) : [];

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
    setState("");
    setCity("");
  };

  const handleStateChange = (event) => {
    setState(event.target.value);
    setCity("");
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const styles = {
    container: {
      maxWidth: "480px",
      margin: "48px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
    },
    field: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: 600,
    },
    select: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "14px",
    },
    summary: {
      marginTop: "28px",
      padding: "16px",
      border: "1px solid #ddd",
      borderRadius: "8px",
    },
  };

  return (
    <main style={styles.container}>
      <h1>Location Selector</h1>

      <p>Select your country, state, and city.</p>

      <form>
        <div style={styles.field}>
          <label htmlFor="country-select" style={styles.label}>
            Country
          </label>

          <select
            id="country-select"
            data-testid="country-select"
            value={country}
            onChange={handleCountryChange}
            style={styles.select}
          >
            <option value="">Select country</option>

            {Object.keys(locationData).map((countryName) => (
              <option key={countryName} value={countryName}>
                {countryName}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label htmlFor="state-select" style={styles.label}>
            State
          </label>

          <select
            id="state-select"
            data-testid="state-select"
            value={state}
            onChange={handleStateChange}
            disabled={!country}
            style={styles.select}
          >
            <option value="">Select state</option>

            {availableStates.map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label htmlFor="city-select" style={styles.label}>
            City
          </label>

          <select
            id="city-select"
            data-testid="city-select"
            value={city}
            onChange={handleCityChange}
            disabled={!state}
            style={styles.select}
          >
            <option value="">Select city</option>

            {availableCities.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
        </div>
      </form>

      <section
        data-testid="selection-summary"
        aria-live="polite"
        style={styles.summary}
      >
        <h2>Selected Location</h2>

        <p>Country: {country || "Not selected"}</p>
        <p>State: {state || "Not selected"}</p>
        <p>City: {city || "Not selected"}</p>
      </section>
    </main>
  );
}
