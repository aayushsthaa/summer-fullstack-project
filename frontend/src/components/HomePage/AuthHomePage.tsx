import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface IProfileData {
  user: {
    name: string;
  };
}

interface IQuizAttempt {
  _id: string;
  questionSet: {
    title: string;
  };
  score: number;
  total: number;
  submittedAt: string;
}

interface IQuiz {
  _id: string;
  title: string;
  questionCount: number;
  createdBy?: string;
}

function AuthHomePage() {
  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [attempts, setAttempts] = useState<IQuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
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

      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        const profileRes = await axios.get(
          "http://localhost:3000/users/profile/me",
          { headers }
        );
        const attemptsRes = await axios.get(
          "http://localhost:3000/users/profile/me/attempts",
          { headers }
        );
        const quizzesRes = await axios.get(
          "http://localhost:3000/api/questions/set/list",
          { headers }
        );

        setProfile(profileRes.data);
        setAttempts(attemptsRes.data);
        setQuizzes(quizzesRes.data.questionSet);
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
      <div className="max-w-7xl mx-auto space-y-10">
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
          <div className="flex-shrink-0 mr-60">
            <img
              src="./src/assets/test.svg"
              alt="Quiz Illustration"
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
                Browse Quizzes
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
                        {attempt.questionSet.title}
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
                You haven't attempted any quizzes yet. Time to start!
              </p>
            )}

            {/* Button to view all quizzes */}
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
      </div>
    </div>
  );
}

export default AuthHomePage;
