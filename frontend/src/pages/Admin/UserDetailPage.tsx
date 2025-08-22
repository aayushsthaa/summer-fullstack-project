import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";

interface IUserDetails {
    user: {
        _id: string;
        name: string;
        username: string;
        email: string;
        role: string;
    };
    profile: {
        bio: string;
        github: string;
        linkedin: string;
        portfolioUrl: string;
    } | null;
}

function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState<IUserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false });
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, title: "", message: ""});

    useEffect(() => {
        const fetchUserData = async () => {
            if (!id) {
                setError("No user ID provided.");
                setIsLoading(false);
                return;
            }
            
            const accessToken = localStorage.getItem("token");
            setIsLoading(true);
            setError(null);

            try {
                const res = await axios.get(`http://localhost:3000/users/profile/${id}`, {
                    headers: { authorization: `Bearer ${accessToken}` }
                });
                setUserDetails(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch user details.");
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
            // Show success and then navigate away
            setNotificationModal({ isOpen: true, title: 'Success', message: 'User deleted successfully.'});
        } catch (err: any) {
            setDeleteModal({ isOpen: false });
            setNotificationModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || 'Failed to delete user.' });
        }
    };


    if (isLoading) {
        return <div className="text-center p-8 dark:text-gray-300">Loading user details...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (!userDetails) {
        return <div className="text-center p-8 dark:text-gray-300">User not found.</div>;
    }

    const { user, profile } = userDetails;

    return (
        <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/admin/users" className="text-blue-600 dark:text-blue-400 hover:underline">
                        &larr; Back to User List
                    </Link>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                    <div className="p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-blue-200 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center">
                                <span className="text-4xl font-bold text-blue-700 dark:text-blue-300">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="text-center sm:text-left flex-grow">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                                <p className="text-md text-gray-500 dark:text-gray-400">@{user.username}</p>
                                <p className="text-md text-gray-600 dark:text-gray-300 mt-1">{user.email}</p>
                            </div>
                             <div className="flex-shrink-0 flex gap-2">
                                <Link to={`/admin/user/edit/${user._id}`} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors" aria-label="Edit User">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </Link>
                                <button onClick={() => setDeleteModal({ isOpen: true })} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 text-red-600 dark:text-red-300 transition-colors" aria-label="Delete User">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</h3>
                                <p className="mt-1 text-gray-800 dark:text-gray-200">{user.role}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</h3>
                                <p className="mt-1 text-gray-800 dark:text-gray-200 text-xs">{user._id}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</h3>
                             <p className="mt-2 text-gray-700 dark:text-gray-300">{profile?.bio || <span className="italic">No bio provided.</span>}</p>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social Links</h3>
                        <div className="space-y-3">
                            {profile?.github ? <SocialLink href={profile.github} text="GitHub" /> : <p className="text-sm text-gray-400 italic">No GitHub link provided.</p>}
                            {profile?.linkedin ? <SocialLink href={profile.linkedin} text="LinkedIn" /> : <p className="text-sm text-gray-400 italic">No LinkedIn link provided.</p>}
                            {profile?.portfolioUrl ? <SocialLink href={profile.portfolioUrl} text="Portfolio" /> : <p className="text-sm text-gray-400 italic">No Portfolio URL provided.</p>}
                        </div>

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
                setNotificationModal({ isOpen: false, title: '', message: ''});
                if (notificationModal.title === 'Success') {
                    navigate('/admin/users');
                }
            }}
            title={notificationModal.title}
            type={notificationModal.title === 'Success' ? 'success' : 'error'}
        >
            {notificationModal.message}
        </Modal>
        </>
    );
}


const SocialLink = ({ href, text }: { href: string; text: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:underline break-all">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span>{href}</span>
    </a>
);


export default UserDetailPage;