import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  zip: Yup.string()
    .matches(/^\d{5}$/, "Zip Code must be exactly 5 digits")
    .required("Zip Code is required"),
});

export function App() {
  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
      <h2>Billing Address</h2>

      <Formik
        initialValues={{ zip: "" }}
        validationSchema={validationSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values) => {
          console.log("Billing address:", values);
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <label htmlFor="zip">Zip Code</label>

            <Field
              id="zip"
              name="zip"
              type="text"
              placeholder="Enter 5-digit Zip Code"
              data-testid="zip-input"
              aria-invalid={Boolean(touched.zip && errors.zip)}
              aria-describedby="zip-error"
            />

            <ErrorMessage name="zip">
              {(message) => (
                <div id="zip-error" role="alert">
                  {message}
                </div>
              )}
            </ErrorMessage>

            <button type="submit">Continue</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
