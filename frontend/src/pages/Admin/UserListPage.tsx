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
  const [searchTerm, setSearchTerm] = useState("");
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
  
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

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

          <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, username, or email..."
                className="w-full input-style"
              />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:flex flex-col bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="flex px-6 py-3 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider text-sm">
              <div className="w-1/4">Name</div>
              <div className="w-1/4">Email</div>
              <div className="w-1/4">Role</div>
              <div className="w-1/4 text-center">Actions</div>
            </div>
            {/* User Rows */}
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="w-1/4">
                  <div className="text-gray-900 dark:text-white font-medium">
                    {user.name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    @{user.username}
                  </div>
                </div>
                <div className="w-1/4 text-gray-500 dark:text-gray-300 text-sm break-all pr-4">
                  {user.email}
                </div>
                <div className="w-1/4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="w-1/4 flex justify-center items-center gap-2">
                  <Link to={`/profile/${user._id}`} title="View User" className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  </Link>
                  <Link to={`/admin/user/edit/${user._id}`} title="Edit User" className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                  </Link>
                  <button onClick={() => openDeleteModal(user._id, user.name)} title="Delete User" className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
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
                <div className="mt-4 flex justify-end items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex gap-2">
                     <Link to={`/profile/${user._id}`} title="View User" className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    </Link>
                    <Link to={`/admin/user/edit/${user._id}`} title="Edit User" className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </Link>
                    <button onClick={() => openDeleteModal(user._id, user.name)} title="Delete User" className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
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
