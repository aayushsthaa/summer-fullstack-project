import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";

export interface IAuthUserList {
  role: string;
  _id: string;
  name: string;
  username: string;
  email: string;
}

function UserListPage() {
  const [users, setUsers] = useState<IAuthUserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: "",
    userName: "",
  });
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error" as "success" | "error",
  });
  useEffect(() => {
    async function fetchData() {
      const accessToken = localStorage.getItem("token");
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:3000/users/list", {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });
        setUsers(res.data.users);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch users. You might not have permission."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const openDeleteModal = (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const handleConfirmDelete = async () => {
    const accessToken = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:3000/api/admin/user/${deleteModal.userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== deleteModal.userId)
      );
      setNotificationModal({
        isOpen: true,
        title: "Success",
        message: "User deleted successfully.",
        type: "success",
      });
    } catch (err: any) {
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to delete user.",
        type: "error",
      });
    } finally {
      setDeleteModal({ isOpen: false, userId: "", userName: "" });
    }
  };

  if (isLoading)
    return (
      <div className="text-center p-8 dark:text-gray-300">Loading users...</div>
    );
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  const roleStyles = (role: string) =>
    role === "admin"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>

            <Link
              to="/admin/user/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Create User</span>
            </Link>
          </div>

          {/* Desktop & Mobile: Flex Container */}
          <div className="hidden md:flex flex-col bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="hidden md:flex px-6 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <div className="w-1/4">Name</div>
              <div className="w-1/4">Email</div>
              <div className="w-1/4">Role</div>
              <div className="w-1/4">Actions</div>
            </div>
            {/* User Rows */}
            {users.map((user) => (
              <div
                key={user._id}
                className="flex flex-col md:flex-row md:items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="md:w-1/4">
                  <div className="text-gray-900 dark:text-white font-medium">
                    {user.name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    @{user.username}
                  </div>
                </div>
                <div className="md:w-1/4 text-gray-500 dark:text-gray-300 text-sm break-all">
                  {user.email}
                </div>
                <div className="md:w-1/4 mt-2 md:mt-0">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="md:w-1/4 mt-2 md:mt-0 flex gap-3">
                  <Link
                    to={`/admin/user/${user._id}`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/user/edit/${user._id}`}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(user._id, user.name)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div className="break-all">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${roleStyles(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="mt-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                  <Link
                    to={`/admin/user/${user._id}`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View Details &rarr;
                  </Link>
                  <div className="flex gap-4">
                    <Link
                      to={`/admin/user/edit/${user._id}`}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => openDeleteModal(user._id, user.name)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, userId: "", userName: "" })
        }
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        type="warning"
        confirmText="Delete"
      >
        Are you sure you want to delete the user{" "}
        <strong>{deleteModal.userName}</strong>? This action cannot be undone.
      </Modal>
      <Modal
        isOpen={notificationModal.isOpen}
        onClose={() =>
          setNotificationModal({
            isOpen: false,
            title: "",
            message: "",
            type: "error",
          })
        }
        title={notificationModal.title}
        type={notificationModal.type}
      >
        {notificationModal.message}
      </Modal>
    </>
  );
}

export default UserListPage;
