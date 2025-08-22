import { useState, useEffect } from "react";
import axios from "axios";
import ProfileForm, { type IProfileData } from "../components/ProfileForm";
import SocialLink from "../components/Profile/SocialLink";

interface IQuizAttempt {
  _id: string;
  questionSet: { _id: string; title: string };
  score: number;
  total: number;
  submittedAt: string;
}

function ProfilePage() {
  const [profileData, setProfileData] = useState<IProfileData | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<IQuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      try {
        const profileRes = await axios.get("http://localhost:3000/users/profile/me", { headers });
        const attemptsRes = await axios.get("http://localhost:3000/users/profile/me/attempts", { headers });

        const { user, profile } = profileRes.data;
        setProfileData({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          bio: profile?.bio || "",
          github: profile?.github || "",
          linkedin: profile?.linkedin || "",
          portfolioUrl: profile?.portfolioUrl || "",
        });

        setQuizAttempts(attemptsRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileUpdate = (updatedData: IProfileData) => {
    setProfileData(updatedData);
  };

  if (isLoading) return <div className="text-center mt-10 p-4 dark:text-gray-300">Loading Profile...</div>;
  if (error) return <div className="text-center mt-10 text-red-500 p-4">{error}</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 text-center">
              <div className="w-28 h-28 rounded-full bg-blue-200 dark:bg-blue-900 mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-blue-700 dark:text-blue-300">{profileData?.name.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">@{profileData?.username}</p>
              <p className="text-gray-500 dark:text-gray-400">{profileData?.email}</p>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Bio</h3>
                <p className="mt-2 text-gray-700 dark:text-gray-300 break-words">{profileData?.bio || <span className="italic text-gray-400">No bio provided.</span>}</p>
              </div>

              <div className="mt-4 space-y-2">
                {profileData?.github && <SocialLink href={profileData.github} icon="github" text="GitHub" />}
                {profileData?.linkedin && <SocialLink href={profileData.linkedin} icon="linkedin" text="LinkedIn" />}
                {profileData?.portfolioUrl && <SocialLink href={profileData.portfolioUrl} icon="portfolio" text="Portfolio" />}
              </div>

              <button onClick={() => setIsModalOpen(true)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quiz Attempts */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quiz Attempt History</h2>
              {quizAttempts.length > 0 ? (
                <ul className="space-y-4">
                  {quizAttempts.map(attempt => (
                    <li key={attempt._id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{attempt.questionSet.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed on {new Date(attempt.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{attempt.score} / {attempt.total}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  You haven't attempted any quizzes yet. <a href="/#/questionset/list" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Explore Quizzes</a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {profileData && <ProfileForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileData={profileData}
        onUpdate={handleProfileUpdate}
      />}
    </>
  );
}

export default ProfilePage;
