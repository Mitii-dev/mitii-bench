import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  age: z
    .string()
    .trim()
    .min(1, "Age is required")
    .regex(/^\d+$/, "Age must be a number")
    .transform(Number)
    .pipe(z.number().min(18, "You must be at least 18 years old")),
});

export function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      age: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Profile submitted:", data);
  };

  const errorMessages = Object.values(errors).map((error) => error.message);

  return (
    <main>
      <h1>Profile Form</h1>

      {errorMessages.length > 0 && (
        <div data-testid="zod-error-list" role="alert">
          <ul>
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="text"
            inputMode="numeric"
            {...register("age")}
          />
          {errors.age && <p>{errors.age.message}</p>}
        </div>

        <button type="submit">Save Profile</button>
      </form>
    </main>
  );
}
