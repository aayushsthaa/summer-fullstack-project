import "./App.css";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import CreateQuestionSetPage from "./pages/QuestionSet/CreateQuestionSetPage";
import { jwtDecode } from "jwt-decode";
import ListQuestionSetPage from "./pages/QuestionSet/ListQuestionSetPage";
import AttemptQuizPage from "./pages/QuestionSet/AttemptQuizPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import UserListPage from "./pages/Admin/UserListPage";
import UserDetailPage from "./pages/Admin/UserDetailPage";
import CreateUserPage from "./pages/Admin/CreateUserPage";
import EditUserPage from "./pages/Admin/EditUserPage";
import AboutUsPage from "./pages/AboutUsPage";
import PageNotFound from "./pages/PageNotFound";

export interface IAuthState {
  isAuth: boolean;
  role: "admin" | "professional" | "guest";
}

export interface IAuthContext extends IAuthState {
  setAuthState: React.Dispatch<React.SetStateAction<IAuthState>>;
}

export interface JwtDecode {
  id: string;
  role: "admin" | "professional";
}

export const AuthContext = createContext<IAuthContext>({
  isAuth: false,
  role: "guest",
  setAuthState: () => {},
});


function App() {
  const [authState, setAuthState] = useState<IAuthState>({
    isAuth: false,
    role: "guest",
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    async function fetchData() {
      axios
        .get("http://localhost:3000/api/verify/me", {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (accessToken) {
            const { role }: JwtDecode = jwtDecode(accessToken);
            setAuthState((prev) => ({
              ...prev,
              isAuth: true,
              role: role,
            }));
          }
        })
        .catch((error) => {
          console.log(error.response?.data?.message || "Error verifying token");
          localStorage.removeItem("token");
        });
    }
    if (accessToken) {
      fetchData();
    }
  }, []);

  return (
    <>
      <AuthContext.Provider
        value={{ isAuth: authState.isAuth, role: authState.role, setAuthState }}
      >
        <NavBar />
        <Routes>
          <Route path="*" element={<PageNotFound/>} />
          {/* GUEST & ALL AUTH Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          {/* GUEST ONLY Routes */}
          {authState?.isAuth === false && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<AboutUsPage/>} />
            </>
          )}

          {/* AUTHENTICATED Routes (Professional & Admin) */}
          {authState?.isAuth === true && (
            <>
              <Route path="/profile/me" element={<ProfilePage />} />
              <Route
                path="/questionset/list"
                element={<ListQuestionSetPage />}
              />
              <Route
                path="/questionset/:id/attempt"
                element={<AttemptQuizPage />}
              />
            </>
          )}

          {/* ADMIN ONLY Routes */}
          {authState?.role === "admin" && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserListPage />} />
              <Route path="/admin/user/:id" element={<UserDetailPage />} />
              <Route path="/admin/user/create" element={<CreateUserPage />} />
              <Route path="/admin/user/edit/:id" element={<EditUserPage />} />
              <Route
                path="/admin/questionset/create"
                element={<CreateQuestionSetPage />}
              />
            </>
          )}
        </Routes>
      </AuthContext.Provider>
    </>
  );
}

export default App;