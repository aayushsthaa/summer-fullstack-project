import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import EditUserForm from "../../components/Admin/EditUserForm";
import type { IAuthUserList } from "./UserListPage";

function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<IAuthUserList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) {
        setError("No user ID provided.");
        setIsLoading(false);
        return;
      }
      
      const accessToken = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:3000/users/profile/${id}`, {
          headers: { authorization: `Bearer ${accessToken}` }
        });
        setUser(res.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (isLoading) {
    return <div className="text-center p-8 dark:text-gray-300">Loading user data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-8 dark:text-gray-300">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
            <div className="mb-4">
                <Link to="/admin/users" className="text-blue-600 dark:text-blue-400 hover:underline">
                    &larr; Back to User List
                </Link>
            </div>
            <EditUserForm userData={user} />
        </div>
    </div>
  );
}

export default EditUserPage;