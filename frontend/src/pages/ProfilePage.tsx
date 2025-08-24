import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProfileForm, {
  type IProfileData,
} from "../components/Profile/ProfileForm";
import SocialLink from "../components/Profile/SocialLink";
import Modal from "../components/Modal";
import { useForm } from "react-hook-form";

interface IQuizAttempt {
  _id: string;
  questionSet: { _id: string; title: string };
  score: number;
  total: number;
  submittedAt: string;
}

interface IStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
}

const getSkillBadgeColor = (
  level: "Beginner" | "Intermediate" | "Advanced"
) => {
  switch (level) {
    case "Beginner":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200";
    case "Intermediate":
      return "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200";
    case "Advanced":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:text-gray-200";
  }
};

// Change Password Modal Component
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChangePasswordFormData = {
  currentPassword: "";
  newPassword: "";
  confirmPassword: "";
};

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>();
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error" as "error" | "success",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    const accessToken = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:3000/users/profile/me/change-password",
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setNotificationModal({
        isOpen: true,
        title: "Success",
        message: "Password changed successfully!",
        type: "success",
      });
    } catch (error: any) {
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to change password.",
        type: "error",
      });
    }
  };

  const handleCloseMainModal = () => {
    reset();
    onClose();
  };

  const handleCloseNotificationAndMain = () => {
    setNotificationModal({ ...notificationModal, isOpen: false });
    if (notificationModal.type === "success") {
      handleCloseMainModal();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Change Password
            </h2>
            <button
              type="button"
              onClick={handleCloseMainModal}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  {...register("currentPassword", {
                    required: "Current password is required",
                  })}
                  className="mt-1 block w-full input-style"
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="mt-1 block w-full input-style"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === newPassword || "The passwords do not match",
                  })}
                  className="mt-1 block w-full input-style"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseMainModal}
                className="py-2 px-4 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-white py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
      <Modal
        isOpen={notificationModal.isOpen}
        onClose={handleCloseNotificationAndMain}
        title={notificationModal.title}
        type={notificationModal.type}
      >
        {notificationModal.message}
      </Modal>
    </>
  );
};

// Set Password Modal Component
interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
type SetPasswordFormData = {
  newPassword: "";
  confirmPassword: "";
};

const SetPasswordModal = ({
  isOpen,
  onClose,
  onSuccess,
}: SetPasswordModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SetPasswordFormData>();
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error" as "error" | "success",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: SetPasswordFormData) => {
    const accessToken = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:3000/users/profile/me/set-password",
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setNotificationModal({
        isOpen: true,
        title: "Success",
        message:
          "Password set successfully! You can now log in with your email and password.",
        type: "success",
      });
    } catch (error: any) {
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to set password.",
        type: "error",
      });
    }
  };

  const handleCloseMainModal = () => {
    reset();
    onClose();
  };

  const handleCloseNotificationAndMain = () => {
    const wasSuccess = notificationModal.type === "success";
    setNotificationModal({ ...notificationModal, isOpen: false });
    if (wasSuccess) {
      handleCloseMainModal();
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Set Your Password
            </h2>
            <button
              type="button"
              onClick={handleCloseMainModal}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="mt-1 block w-full input-style"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === newPassword || "The passwords do not match",
                  })}
                  className="mt-1 block w-full input-style"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseMainModal}
                className="py-2 px-4 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-white py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
              >
                Set Password
              </button>
            </div>
          </form>
        </div>
      </div>
      <Modal
        isOpen={notificationModal.isOpen}
        onClose={handleCloseNotificationAndMain}
        title={notificationModal.title}
        type={notificationModal.type}
      >
        {notificationModal.message}
      </Modal>
    </>
  );
};

function ProfilePage() {
  const [profileData, setProfileData] = useState<IProfileData | null>(null);
  const [stats, setStats] = useState<IStats | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<IQuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not authenticated.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const profileRes = await axios.get(
        "http://localhost:3000/users/profile/me",
        { headers }
      );
      const attemptsRes = await axios.get(
        "http://localhost:3000/users/profile/me/attempts",
        { headers }
      );

      const { user, profile, stats, hasPassword } = profileRes.data;
      setProfileData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: profile?.bio || "",
        github: profile?.github || "",
        linkedin: profile?.linkedin || "",
        portfolioUrl: profile?.portfolioUrl || "",
        skills: profile?.skills || [],
      });
      setStats(stats);
      setHasPassword(hasPassword);
      setQuizAttempts(attemptsRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileUpdate = (updatedData: IProfileData) => {
    setProfileData(updatedData);
  };

  if (isLoading)
    return (
      <div className="text-center mt-10 p-4 dark:text-gray-300">
        Loading Profile...
      </div>
    );
  if (error)
    return <div className="text-center mt-10 text-red-500 p-4">{error}</div>;
  if (!profileData)
    return (
      <div className="text-center mt-10 p-4 dark:text-gray-300">
        Could not load profile data.
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 flex flex-col h-full">
              <div className="text-center">
                <div className="w-28 h-28 rounded-full bg-blue-200 dark:bg-blue-900 mx-auto flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                    {profileData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  @{profileData.username}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {profileData.email}
                </p>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Bio
                </h3>
                <p className="mt-2 text-gray-700 dark:text-gray-300 break-words">
                  {profileData.bio || (
                    <span className="italic text-gray-400">
                      No bio provided.
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {profileData.github && (
                  <SocialLink
                    href={profileData.github}
                    icon="github"
                    text="GitHub"
                  />
                )}
                {profileData.linkedin && (
                  <SocialLink
                    href={profileData.linkedin}
                    icon="linkedin"
                    text="LinkedIn"
                  />
                )}
                {profileData.portfolioUrl && (
                  <SocialLink
                    href={profileData.portfolioUrl}
                    icon="portfolio"
                    text="Portfolio"
                  />
                )}
              </div>

              {/* Skills Section */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex-grow">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase text-center mb-3">
                  Skills
                </h3>
                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getSkillBadgeColor(
                          skill.level
                        )}`}
                      >
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-2 italic text-sm">
                    No skills to display.
                  </p>
                )}
              </div>
              <div className="mt-auto pt-6 space-y-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
                {hasPassword ? (
                  <button
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg transition-colors"
                  >
                    Change Password
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSetPasswordModalOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Set Password
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics Card */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Statistics
              </h2>
              {stats ? (
                <div className="grid grid-cols-3 text-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalAttempts}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Attempts
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.averageScore}%
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Average
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.highestScore}%
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Highest
                    </p>
                  </div>
                </div>
              ) : (
                <p className="italic text-gray-500 dark:text-gray-400 text-sm">
                  No stats available.
                </p>
              )}
            </div>

            {/* Quiz Attempts */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Assessment History
              </h2>
              {quizAttempts.length > 0 ? (
                <ul className="space-y-4">
                  {quizAttempts.map((attempt) => (
                    <li
                      key={attempt._id}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center flex-wrap gap-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {attempt.questionSet.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Completed on{" "}
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {attempt.score} / {attempt.total}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Score
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  You haven't attempted any assessments yet.{" "}
                  <a
                    href="/#/questionset/list"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Explore Assessments
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onUpdate={handleProfileUpdate}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <SetPasswordModal
        isOpen={isSetPasswordModalOpen}
        onClose={() => setIsSetPasswordModalOpen(false)}
        onSuccess={fetchData}
      />
    </>
  );
}

export default ProfilePage;
