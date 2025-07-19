import * as Yup from "yup";

const registerSchema = Yup.object({
  username: Yup.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),

  email: Yup.string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Min 6 characters")
    .required("Password is required")
});

export default registerSchema;