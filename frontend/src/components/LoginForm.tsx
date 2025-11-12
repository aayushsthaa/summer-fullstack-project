import { useContext, useState } from "react";
import FormBtn from "../components/FormBtn";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { AuthContext, type JwtDecode } from "../App";
import { jwtDecode } from "jwt-decode";
import Modal from "./Modal";
import googleIcon from "../assets/google.png";
import facebookIcon from "../assets/facebook.png";

function LoginForm() {
  const navigate = useNavigate();
  const { setAuthState } = useContext(AuthContext);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });

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
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        const profile = res.data;
        const backendRes = await axios.post(
          "https://education-university-backend.onrender.com/users/auth/google",
          { profile }
        );
        handleAuthSuccess(backendRes.data.token);
      } catch (err) {
        console.error("Google login error:", err);
        setModal({
          isOpen: true,
          title: "Login Failed",
          message: "Google login failed. Please try again.",
        });
      }
    },
    onError: () => {
      console.log("Login Failed");
      setModal({
        isOpen: true,
        title: "Login Failed",
        message: "Google login failed. Please try again.",
      });
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { email, password };
    axios
      .post("https://education-university-backend.onrender.com/users/login", data)
      .then((response) => {
        handleAuthSuccess(response.data.token);
      })
      .catch((error) => {
        setModal({
          isOpen: true,
          title: "Login Failed",
          message:
            error.response?.data?.message || "An unknown error occurred.",
        });
      });
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <div className="form-container w-full h-full mt-4 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col justify-center gap-6 px-4 py-8 sm:p-8 md:p-10 bg-white dark:bg-gray-900 dark:text-white mx-auto rounded-lg border border-gray-200 dark:border-0 drop-shadow-2xl dark:sm:drop-shadow-gray-500  w-full max-w-xl">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-500">
            Log in
          </h2>
          <p className="text-md text-gray-500 dark:text-white">
            Welcome back, Please log in to continue
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-style"
              placeholder="Enter your email"
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-style"
              placeholder="Enter your password"
            />
            <div className="flex flex-col-reverse justify-between md:items-center mt-4 gap-4 md:flex-row">
              <a
                href="#"
                className="hover:text-blue-500 hover:underline text-blue-700 dark:text-blue-300 "
              >
                Forgot password?
              </a>
              <FormBtn name="Log in" />
            </div>
          </form>
          <p className="text-md text-gray-500 dark:text-white">
            Don't have an account?
            <Link
              to="/register"
              className="text-blue-700 dark:text-blue-300 hover:underline hover:text-blue-500"
            >
              Register
            </Link>
          </p>
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
                src={googleIcon}
                alt="google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            <button className="px-4 py-2 flex-1 rounded-md hover:bg-blue-500 bg-blue-700 text-white w-full flex gap-2 items-center justify-center">
              <img
                src={facebookIcon}
                alt="facebook"
                className="w-6 h-6"
              />
              Continue with Facebook
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, title: "", message: "" })}
        title={modal.title}
        type="error"
      >
        {modal.message}
      </Modal>
    </>
  );
}
export default LoginForm;
