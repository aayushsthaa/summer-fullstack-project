import { useContext } from "react";
import AuthHomePage from "../components/HomePage/AuthHomePage";
import { AuthContext } from "../App";
import UnAuthHomePage from "../components/HomePage/UnAuthHomePage";
import AdminDashboardPage from "./Admin/AdminDashboardPage";

function HomePage() {
  const { isAuth, role } = useContext(AuthContext);

  if (!isAuth) {
    return <UnAuthHomePage />;
  }

  if (role === "admin") {
    return <AdminDashboardPage />;
  }

  return <AuthHomePage />;
}

export default HomePage;
