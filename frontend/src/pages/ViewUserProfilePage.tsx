import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SocialLink from "../components/Profile/SocialLink";
import { AuthContext } from "../App";
import Modal from "../components/Modal";

// Interfaces for the data structure
interface IUser {
    _id: string;
    name: string;
    username: string;
    email: string;
    role: string;
}
interface IProfile {
    bio: string;
    github: string;
    linkedin: string;
    portfolioUrl: string;
    skills: { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' }[];
}
interface IQuizAttempt {
    _id: string;
    questionSet: { title: string } | null;
    score: number;
    total: number;
    submittedAt: string;
}
interface IStats {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
}
interface IUserData {
    user: IUser;
    profile: IProfile | null;
    attempts: IQuizAttempt[];
    stats: IStats;
}

const getSkillBadgeColor = (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200';
      case 'Intermediate':
        return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/60 dark:text-gray-200';
    }
  };

function ViewUserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { role: loggedInUserRole } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [userData, setUserData] = useState<IUserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false });
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: "", message: "", type: "error" as "success" | "error" });


    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!id || !token) {
                setError("Cannot fetch profile.");
                setIsLoading(false);
                return;
            }

            try {
                const res = await axios.get(`http://localhost:3000/users/profile/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(res.data);
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
                setError("Could not load user profile.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    const handleConfirmDelete = async () => {
        const accessToken = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:3000/api/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setDeleteModal({ isOpen: false });
            setNotificationModal({ isOpen: true, title: 'Success', message: 'User deleted successfully.', type: 'success'});
        } catch (err: any) {
            setDeleteModal({ isOpen: false });
            setNotificationModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || 'Failed to delete user.', type: 'error' });
        }
    };

    if (isLoading) return <div className="text-center p-8 dark:text-gray-300">Loading profile...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!userData) return <div className="text-center p-8 dark:text-gray-300">User not found.</div>;

    const { user, profile, attempts, stats } = userData;

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 flex flex-col h-full">
                            <div className="text-center">
                                <div className="w-28 h-28 rounded-full bg-blue-200 dark:bg-blue-900 mx-auto flex items-center justify-center mb-4">
                                <span className="text-4xl font-bold text-blue-700 dark:text-blue-300">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>

                            <div className="mt-4 text-center">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Bio</h3>
                                <p className="mt-2 text-gray-700 dark:text-gray-300 break-words">{profile?.bio || <span className="italic text-gray-400">No bio provided.</span>}</p>
                            </div>

                            <div className="mt-4 space-y-2">
                                {profile?.github && <SocialLink href={profile.github} icon="github" text="GitHub" />}
                                {profile?.linkedin && <SocialLink href={profile.linkedin} icon="linkedin" text="LinkedIn" />}
                                {profile?.portfolioUrl && <SocialLink href={profile.portfolioUrl} icon="portfolio" text="Portfolio" />}
                            </div>
                            
                            {/* Skills Section */}
                            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex-grow">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase text-center mb-3">Skills</h3>
                                {profile?.skills && profile.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {profile.skills.map((skill, index) => (
                                    <span key={index} className={`px-3 py-1 text-sm font-medium rounded-full ${getSkillBadgeColor(skill.level)}`}>
                                        {skill.name}
                                    </span>
                                    ))}
                                </div>
                                ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-2 italic text-sm">No skills to display.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Admin Actions */}
                        {loggedInUserRole === 'admin' && (
                             <div className="flex justify-end gap-4">
                                <Link to={`/admin/user/edit/${user._id}`} className="text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors">
                                    Edit User
                                </Link>
                                <button onClick={() => setDeleteModal({ isOpen: true })} className="bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-bold py-2 px-4 rounded-lg transition-colors">
                                    Delete User
                                </button>
                            </div>
                        )}
                        {/* Statistics Card */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Statistics</h2>
                            <div className="grid grid-cols-3 text-center gap-4">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalAttempts}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Attempts</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.averageScore}%</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Average</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.highestScore}%</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Highest</p>
                                </div>
                            </div>
                        </div>

                        {/* Quiz Attempts */}
                        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assessment History</h2>
                        {attempts.length > 0 ? (
                            <ul className="space-y-4">
                            {attempts.map(attempt => (
                                <li key={attempt._id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{attempt.questionSet?.title || "Deleted Assessment"}</p>
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
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8 italic">This user has not attempted any assessments yet.</p>
                        )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false })}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                type="warning"
                confirmText="Delete User"
            >
                Are you sure you want to delete <strong>{user.name}</strong>? This action is irreversible and will permanently remove all their data.
            </Modal>
            <Modal
                isOpen={notificationModal.isOpen}
                onClose={() => {
                    setNotificationModal({ isOpen: false, title: '', message: '', type: 'error'});
                    if (notificationModal.type === 'success') {
                        navigate('/admin/users');
                    }
                }}
                title={notificationModal.title}
                type={notificationModal.type}
            >
                {notificationModal.message}
            </Modal>
        </>
    );
}

export default ViewUserProfilePage;