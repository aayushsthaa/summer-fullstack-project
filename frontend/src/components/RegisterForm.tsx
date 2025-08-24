import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import FormBtn from "./FormBtn";
import { AuthContext, type JwtDecode } from "../App";
import { jwtDecode } from "jwt-decode";
import Modal from "./Modal";

function RegisterForm() {
  const navigate = useNavigate();
  const { setAuthState } = useContext(AuthContext);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  const handleAuthSuccess = (token: string) => {
    localStorage.setItem("token", token);
    const { role }: JwtDecode = jwtDecode(token);
    setAuthState({ isAuth: true, role });
    navigate("/");
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { access_token } = tokenResponse;
        const res = await axios.get(
          `https://www.googleapis.com/oauth2/v3/userinfo`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const backendRes = await axios.post(
          "http://localhost:3000/users/auth/google",
          { profile: res.data }
        );
        handleAuthSuccess(backendRes.data.token);
      } catch (err) {
        console.error("Google auth error:", err);
        setModal({
          isOpen: true,
          title: "Authentication Failed",
          message: "Google authentication failed. Please try again.",
          type: "error",
        });
      }
    },
    onError: () => {
      console.log("Login Failed");
      setModal({
        isOpen: true,
        title: "Authentication Failed",
        message: "Google authentication failed. Please try again.",
        type: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = firstName + " " + lastName;
    const finalData = { name, username, email, password };

    axios
      .post("http://localhost:3000/users/create", finalData)
      .then(() => {
        setModal({
          isOpen: true,
          title: "Success!",
          message: "User registered successfully! Please log in.",
          type: "success",
          onConfirm: () => navigate("/login"),
        });
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          "An error occurred during registration.";
        setModal({
          isOpen: true,
          title: "Registration Failed",
          message: message,
          type: "error",
        });
      });
  };
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <div className="form-container w-full h-full mt-4 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col justify-center gap-6 px-4 py-8 sm:p-8 md:p-10 bg-white dark:bg-gray-900 dark:text-white mx-auto rounded-lg border border-gray-200 dark:border-0 drop-shadow-2xl dark:sm:drop-shadow-gray-500  w-full max-w-xl">
          <div className="w-full"></div>
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-500 text-center">
            Create an account
          </h2>
          <p className="text-sm text-gray-500 dark:text-white text-center">
            Create a new account to get started
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="input-style flex-1"
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="input-style flex-1"
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="input-style"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input-style"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input-style"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FormBtn name="Register" />
            <p className="text-md text-gray-500 dark:text-white">
              Already have an account?
              <Link
                to="/login"
                className="text-blue-700 hover:underline hover:text-blue-500 dark:text-blue-300"
              >
                Log in
              </Link>
            </p>
          </form>
          <div className="flex items-center justify-between">
            <hr className="w-full border-gray-300" />
            <span className="px-2 text-gray-500 dark:text-white shrink-0">
              Or continue with
            </span>
            <hr className="w-full border-gray-300" />
          </div>
          <div className="flex  flex-col justify-between gap-4 ">
            <button
              className="w-full flex gap-2 items-center justify-center px-4 py-2 flex-1 rounded-md hover:bg-gray-200 dark:bg-zinc-100 dark:text-black border border-gray-300 dark:border-0"
              onClick={() => login()}
            >
              <img
                src="./src/assets/google.png"
                alt="google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            <button className="px-4 py-2 flex-1 rounded-md hover:bg-blue-500 bg-blue-700 text-white w-full flex gap-2 items-center justify-center">
              <img
                src="./src/assets/facebook.png"
                alt="facebook"
                className="w-6 h-6"
              />
              Continue with Facebook
            </button>
          </div>
          <p className="text-md text-gray-500 dark:text-white">
            By registering, you agree to our{" "}
            <a
              href="#"
              className="text-blue-500 dark:text-blue-300 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-500 dark:text-blue-300 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          const onConfirm = modal.onConfirm;
          setModal({ ...modal, isOpen: false });
          if (onConfirm) {
            onConfirm();
          }
        }}
        title={modal.title}
        type={modal.type}
      >
        {modal.message}
      </Modal>
    </>
  );
}
export default RegisterForm;
