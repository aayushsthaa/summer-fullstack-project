import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Simplified interface for data structure
interface IAttemptDetails {
    _id: string;
    questionSetTitle: string;
    score: number;
    total: number;
    submittedAt: string;
}

function AttemptReviewPage() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const [attempt, setAttempt] = useState<IAttemptDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttemptDetails = async () => {
            const token = localStorage.getItem("token");
            if (!attemptId || !token) {
                setError("Cannot fetch attempt details.");
                setIsLoading(false);
                return;
            }

            try {
                const res = await axios.get(`http://localhost:3000/users/profile/me/attempts/${attemptId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttempt(res.data);
            } catch (err) {
                console.error("Failed to fetch attempt details:", err);
                setError("Could not load attempt details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttemptDetails();
    }, [attemptId]);

    if (isLoading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="text-gray-700 dark:text-gray-300 text-lg">Loading Review...</p></div>;
    if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center p-8 text-red-500">{error}</div></div>;
    if (!attempt) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center p-8 dark:text-gray-300">Attempt not found.</div></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{attempt.questionSetTitle}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Completed on {new Date(attempt.submittedAt).toLocaleString()}
                    </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-8">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Final Score</p>
                    <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{attempt.score} <span className="text-4xl text-gray-400 dark:text-gray-500">/ {attempt.total}</span></p>
                </div>
                
                <div className="pt-4">
                    <Link to="/profile/me" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 inline-block">
                        Back to Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AttemptReviewPage;