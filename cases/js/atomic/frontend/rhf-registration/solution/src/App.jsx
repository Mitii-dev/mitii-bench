import { useForm } from "react-hook-form";

export function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Registration successful:", data);
  };

  return (
    <main>
      <h1>Registration</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            data-testid="input-username"
            {...register("username", {
              required: "Username is required",
            })}
          />
          {errors.username && <p role="alert">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            data-testid="input-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password && <p role="alert">{errors.password.message}</p>}
        </div>

        <button type="submit">Register</button>
      </form>
    </main>
  );
}
