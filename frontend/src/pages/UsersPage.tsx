import { useEffect, useState } from "react";
import axios from "axios";
import UserCard from "../components/UserCard";
import { jwtDecode } from "jwt-decode";
import type { JwtDecode as AppJwtDecode } from "../App";

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "professional" | "admin";
  profile?: {
    bio?: string;
    skills?: {
      name: string;
      level: "Beginner" | "Intermediate" | "Advanced";
    }[];
  };
}

function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const accessToken = localStorage.getItem("token");
      if (!accessToken) {
        setError("Authentication required.");
        setIsLoading(false);
        return;
      }

      const decodedToken: AppJwtDecode = jwtDecode(accessToken);
      const loggedInUserId = decodedToken.id;

      try {
        const res = await axios.get(
          "https://education-university-backend.onrender.com/users/professionals",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const allUsers: IUser[] = res.data;
        const otherUsers = allUsers.filter(
          (user) => user._id !== loggedInUserId
        );

        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Could not load users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = users.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(lowercasedTerm);
      const usernameMatch = user.username
        .toLowerCase()
        .includes(lowercasedTerm);
      const skillsMatch = user.profile?.skills?.some((skill) =>
        skill.name.toLowerCase().includes(lowercasedTerm)
      );
      return nameMatch || usernameMatch || !!skillsMatch;
    });
    setFilteredUsers(results);
  }, [searchTerm, users]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300 text-lg animate-pulse">
          Loading Users...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            Our Community
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our community of skilled learners. Connect, learn, and grow
            together.
          </p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search by name, username, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-style"
          />
        </div>

        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              No Users Found
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No users match your search."
                : "It looks like our community is just getting started!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
