import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserCard from "../UserCard";
import type { IUser } from "../../pages/UsersPage";
import { jwtDecode } from "jwt-decode";
import type { JwtDecode as AppJwtDecode } from "../../App";
import testSvg from "../../assets/test.svg";

interface IProfileData {
  user: {
    name: string;
  };
}

interface IQuizAttempt {
  _id: string;
  questionSet: {
    title: string;
  } | null;
  score: number;
  total: number;
  submittedAt: string;
}

function AuthHomePage() {
  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [attempts, setAttempts] = useState<IQuizAttempt[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const accessToken = localStorage.getItem("token");
      if (!accessToken) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }
      
      const decodedToken: AppJwtDecode = jwtDecode(accessToken);
      const loggedInUserId = decodedToken.id;

      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        const profileRes = axios.get("https://education-university-backend.onrender.com/users/profile/me", { headers });
        const attemptsRes = axios.get("https://education-university-backend.onrender.com/users/profile/me/attempts", { headers });
        const usersRes = axios.get("https://education-university-backend.onrender.com/users/professionals", { headers });
        
        const [profileData, attemptsData, usersData] = await Promise.all([profileRes, attemptsRes, usersRes]);

        setProfile(profileData.data);
        setAttempts(attemptsData.data);
        
        const allUsers: IUser[] = usersData.data;
        const otherUsers = allUsers.filter(user => user._id !== loggedInUserId);
        setUsers(otherUsers);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load your dashboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Simplified statistics
  const userStats = { totalAttempts: attempts.length, averageScore: 0, highestScore: 0 };
  if (attempts.length > 0) {
    let totalPercentage = 0;
    let highestPercentage = 0;

    attempts.forEach((attempt) => {
      const percentage = attempt.total ? (attempt.score / attempt.total) * 100 : 0;
      totalPercentage += percentage;
      if (percentage > highestPercentage) highestPercentage = percentage;
    });

    userStats.averageScore = Math.round(totalPercentage / attempts.length);
    userStats.highestScore = Math.round(highestPercentage);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300 text-lg animate-pulse">
          Loading Your Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row items-center gap-6 justify-center">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
              Welcome back, {profile?.user.name}!
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              Ready to test your knowledge? Let's get started.
            </p>
          </div>
          <div className="flex-shrink-0 lg:mr-60">
            <img
              src={testSvg}
              alt="Assessment Illustration"
              className="w-48 h-48"
            />
          </div>
        </div>

        {/* Statistics and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Your Statistics
            </h2>
            <div className="grid grid-cols-3 text-center gap-4">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.totalAttempts}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Attempts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.averageScore}%</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.highestScore}%</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Highest</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/questionset/list"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
              >
                Browse Assessments
              </Link>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Recent Activity
            </h2>
            {attempts.length > 0 ? (
              <ul className="space-y-4">
                {attempts.slice(0, 3).map((attempt) => (
                  <li key={attempt._id} className="flex justify-between items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {attempt.questionSet?.title || "Deleted Assessment"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(attempt.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {attempt.score}/{attempt.total}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You haven't attempted any assessments yet. Time to start!
              </p>
            )}

            {attempts.length > 3 && (
              <div className="mt-4 text-center">
                <Link
                  to="/profile/me"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300"
                >
                  View All
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Meet Other Users Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Meet Other Users</h2>
            <Link to="/users/professionals" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
              View All &rarr;
            </Link>
          </div>
          {users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.slice(0, 3).map(user => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">No other users found yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthHomePage;
