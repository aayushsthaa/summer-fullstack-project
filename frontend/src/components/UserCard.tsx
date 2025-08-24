import { Link } from "react-router-dom";
import type { IUser } from "../pages/UsersPage";

const getSkillBadgeColor = (
  level?: "Beginner" | "Intermediate" | "Advanced"
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

const UserCard = ({ user }: { user: IUser }) => {
  const { name, username, profile } = user;
  const bioSnippet = profile?.bio
    ? profile.bio.length > 80
      ? `${profile.bio.substring(0, 80)}...`
      : profile.bio
    : "No bio available.";
  const topSkills = profile?.skills?.slice(0, 3) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-grow truncate">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{username}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 flex-grow min-h-[60px]">
        {bioSnippet}
      </p>

      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
          Top Skills
        </h4>
        <div className="flex flex-wrap gap-2 min-h-[30px]">
          {topSkills.length > 0 ? (
            topSkills.map((skill, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillBadgeColor(
                  skill.level
                )}`}
              >
                {skill.name} ({skill.level})
              </span>
            ))
          ) : (
            <p className="italic text-gray-400 text-xs">No skills listed.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/profile/${user._id}`}
          className="block w-full text-center bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default UserCard;
