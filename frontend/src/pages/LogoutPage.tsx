import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();
  navigate("/");
  return localStorage.removeItem("token");
}

export default Logout;
