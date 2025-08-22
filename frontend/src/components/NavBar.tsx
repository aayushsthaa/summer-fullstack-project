import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ToggleDark from "./ToggleDark";
import Logo from "./Logo";
import { AuthContext } from "../App";
import Modal from "./Modal";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { isAuth, setAuthState, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const closeNav = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthState({ isAuth: false, role: "guest" });
    closeNav();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const openLogoutModal = () => {
    if (isOpen) {
      closeNav();
    }
    setIsLogoutModalOpen(true);
  };

  return (
    <>
      <header className="relative w-full ">
        <div className="flex justify-between items-center px-6 py-4 h-24 dark:bg-gray-950 dark:text-white shadow-sm">
          <Link to="/" className="h-20">
            <Logo />
          </Link>
          <ToggleDark />
          <nav className="hidden sm:flex justify-end items-center gap-6 pr-16">
            <NavLink to="/" className="hover:text-blue-500">
              Home
            </NavLink>
            {isAuth===false && <NavLink to="/about" className="hover:text-blue-500">
              About Us
            </NavLink> }
            {isAuth ? (
              <>
                <NavLink to="/questionset/list" className="hover:text-blue-400">
                  Assessments
                </NavLink>
                <NavLink to={role === 'admin' ? "/admin/users" : "/users/professionals"} className="hover:text-blue-400">
                  Users
                </NavLink>
                <NavLink to="/profile/me" className="hover:text-blue-400">
                  Profile
                </NavLink>
                <button
                  onClick={openLogoutModal}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="border border-blue-700 dark:border-white text-blue-700 dark:text-white py-2 px-4 rounded-md hover:bg-blue-500 hover:text-white dark:hover:border-blue-700 w-32 text-center"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className=" bg-blue-700 hover:bg-blue-500 text-white py-2 px-4 rounded-md w-32 text-center"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
          <button
            className="w-8 h-8 sm:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <figure className="w-full h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth="0.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="dark:stroke-white stroke-black"
              >
                <path d="M4 6l16 0" />
                <path d="M4 12l16 0" />
                <path d="M4 18l16 0" />
              </svg>
            </figure>
          </button>
        </div>

        <div
          className={`fixed top-24 right-0 w-full h-[calc(100vh-6rem)] bg-white dark:bg-gray-950 dark:text-white transform transition-transform duration-300 ease-in-out z-50 sm:hidden ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col items-center justify-center h-full gap-8 text-lg">
            <NavLink to="/" onClick={closeNav} className="hover:text-blue-400">
              Home
            </NavLink>
            {isAuth ? (
              <>
                <NavLink
                  to="/questionset/list"
                  onClick={closeNav}
                  className="hover:text-blue-400"
                >
                  Assessments
                </NavLink>
                 <NavLink to={role === 'admin' ? "/admin/users" : "/users/professionals"} onClick={closeNav} className="hover:text-blue-400">
                  Users
                </NavLink>
                {role === "admin" && (
                  <>
                    <NavLink
                      to="/admin/questionset/create"
                      onClick={closeNav}
                      className="hover:text-blue-400"
                    >
                      New Assessment
                    </NavLink>
                  </>
                )}
                <NavLink
                  to="/profile/me"
                  onClick={closeNav}
                  className="hover:text-blue-400"
                >
                  Profile
                </NavLink>
                <button
                  onClick={openLogoutModal}
                  className="font-semibold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/register"
                  onClick={closeNav}
                  className="hover:text-blue-400"
                >
                  Register
                </NavLink>
                <NavLink
                  to="/login"
                  onClick={closeNav}
                  className="hover:text-blue-400"
                >
                  Login
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        type="warning"
        confirmText="Logout"
      >
        Are you sure you want to log out?
      </Modal>
    </>
  );
}

export default NavBar;