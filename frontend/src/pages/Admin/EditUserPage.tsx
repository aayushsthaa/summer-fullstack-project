import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import EditUserForm from "../../components/Admin/EditUserForm";

export interface IEditableUserData {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "professional" | "admin";
  bio?: string;
  skills?: { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[];
  github?: string;
  linkedin?: string;
  portfolioUrl?: string;
}

function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<IEditableUserData | null>(null);
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
        const res = await axios.get(
          `http://localhost:3000/users/profile/${id}`,
          {
            headers: { authorization: `Bearer ${accessToken}` },
          }
        );

        const { user, profile } = res.data;
        const combinedData: IEditableUserData = {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          bio: profile?.bio || "",
          skills: profile?.skills || [],
          github: profile?.github || "",
          linkedin: profile?.linkedin || "",
          portfolioUrl: profile?.portfolioUrl || "",
        };
        setUserData(combinedData);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch user details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center p-8 dark:text-gray-300">
        Loading user data...
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!userData) {
    return (
      <div className="text-center p-8 dark:text-gray-300">User not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <Link
            to="/admin/users"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            &larr; Back to User List
          </Link>
        </div>
        <EditUserForm userData={userData} />
      </div>
    </div>
  );
}

export default EditUserPage;
