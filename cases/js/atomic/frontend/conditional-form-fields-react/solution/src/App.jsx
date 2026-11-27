import { useState } from "react";

const INITIAL_VALUES = {
  accountType: "individual",
  fullName: "",
  email: "",
  companyName: "",
  taxId: "",
};

export function App() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const isBusiness = values.accountType === "business";

  const updateField = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setSubmitted(false);
  };

  const handleAccountTypeChange = (event) => {
    const accountType = event.target.value;

    setValues((prev) => ({
      ...prev,
      accountType,
      ...(accountType === "individual"
        ? {
            companyName: "",
            taxId: "",
          }
        : {}),
    }));

    setErrors({});
    setSubmitted(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!values.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!values.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (isBusiness) {
      if (!values.companyName.trim()) {
        newErrors.companyName = "Company name is required.";
      }

      if (!values.taxId.trim()) {
        newErrors.taxId = "Tax ID is required.";
      }
    }

    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();

    setErrors(validationErrors);
    setSubmitted(Object.keys(validationErrors).length === 0);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  };

  const renderField = (label, field, type = "text") => (
    <div style={fieldStyle}>
      <label htmlFor={field}>{label}</label>

      <input
        id={field}
        type={type}
        value={values[field]}
        onChange={(event) => updateField(field, event.target.value)}
        data-testid={field}
        aria-invalid={Boolean(errors[field])}
        aria-describedby={errors[field] ? `${field}-error` : undefined}
        style={{
          ...inputStyle,
          borderColor: errors[field] ? "#dc2626" : "#d1d5db",
        }}
      />

      {errors[field] && (
        <span
          id={`${field}-error`}
          role="alert"
          style={{ color: "#dc2626", fontSize: "13px" }}
        >
          {errors[field]}
        </span>
      )}
    </div>
  );

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <h1>Account Registration</h1>

      <p>Enter your details to create an account.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={fieldStyle}>
          <label htmlFor="account-type">Account Type</label>

          <select
            id="account-type"
            data-testid="account-type"
            value={values.accountType}
            onChange={handleAccountTypeChange}
            style={inputStyle}
          >
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>
        </div>

        {renderField("Full Name", "fullName")}

        {renderField("Email Address", "email", "email")}

        {isBusiness && (
          <section
            data-testid="business-fields"
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "18px", marginTop: 0 }}>
              Business Information
            </h2>

            {renderField("Company Name", "companyName")}

            {renderField("Tax ID", "taxId")}
          </section>
        )}

        <button
          type="submit"
          data-testid="submit-btn"
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          Create Account
        </button>

        {submitted && (
          <p
            data-testid="success-message"
            role="status"
            style={{
              color: "#15803d",
              marginTop: "16px",
            }}
          >
            Registration successful!
          </p>
        )}
      </form>
    </main>
  );
}
