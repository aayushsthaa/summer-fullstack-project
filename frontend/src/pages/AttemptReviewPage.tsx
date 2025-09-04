import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces for data structure
interface IChoiceSnapshot {
    text: string;
    isCorrect: boolean;
    isSelectedByUser: boolean;
}
interface IQuestionSnapshot {
    questionText: string;
    isCorrectForUser: boolean;
    choices: IChoiceSnapshot[];
}
interface IAttemptDetails {
    _id: string;
    questionSetTitle: string;
    score: number;
    total: number;
    submittedAt: string;
    questionsSnapshot: IQuestionSnapshot[];
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

    if (isLoading) return <div className="text-center p-8 dark:text-gray-300">Loading Review...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!attempt) return <div className="text-center p-8 dark:text-gray-300">Attempt not found.</div>;

    const hasDetailedReview = attempt.questionsSnapshot && attempt.questionsSnapshot.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/profile/me" className="text-blue-600 dark:text-blue-400 hover:underline">
                        &larr; Back to Profile
                    </Link>
                </div>
                
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{attempt.questionSetTitle}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Completed on {new Date(attempt.submittedAt).toLocaleString()}
                        </p>
                        <div className="mt-4 bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">FINAL SCORE</p>
                            <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{attempt.score} / {attempt.total}</p>
                        </div>
                    </div>
                    
                    {hasDetailedReview ? (
                        <div className="space-y-8">
                            {attempt.questionsSnapshot.map((question, index) => (
                                <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    {/* Question Header */}
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${question.isCorrectForUser ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {question.isCorrectForUser ? '✓' : '✗'}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex-grow">
                                            <span className="text-gray-500 dark:text-gray-400">Question {index + 1}: </span>
                                            {question.questionText || <span className="italic text-gray-400">[Question text not available]</span>}
                                        </h2>
                                    </div>

                                    {/* Choices List */}
                                    <div className="mt-4 pl-12 space-y-3">
                                        {question.choices && question.choices.length > 0 ? (
                                            question.choices.map((choice, choiceIndex) => {
                                                const isCorrectAnswer = choice.isCorrect;
                                                const isUserSelection = choice.isSelectedByUser;
                                                
                                                let styleClasses = 'border-2 rounded-lg'; // Base outline style
                                                if (isCorrectAnswer) {
                                                    styleClasses += ' border-green-500 dark:border-green-500';
                                                } else if (isUserSelection) {
                                                    // This is an incorrect answer the user selected
                                                    styleClasses += ' border-red-500 dark:border-red-500';
                                                } else {
                                                    // This is a distractor the user did not select
                                                    styleClasses += ' border-gray-300 dark:border-gray-600';
                                                }

                                                return (
                                                    <div key={choiceIndex} className={`p-3 ${styleClasses}`}>
                                                        <div className="flex justify-between items-center gap-4">
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">{choice.text}</p>
                                                            <div className="text-xs font-bold text-right flex-shrink-0">
                                                                {isUserSelection && isCorrectAnswer && (
                                                                    <p className="text-green-700 dark:text-green-400">Your Answer (Correct)</p>
                                                                )}
                                                                {isUserSelection && !isCorrectAnswer && (
                                                                    <p className="text-red-700 dark:text-red-400">Your Answer (Incorrect)</p>
                                                                )}
                                                                {!isUserSelection && isCorrectAnswer && (
                                                                    <p className="text-green-700 dark:text-green-400">Correct Answer</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="italic text-gray-500 dark:text-gray-400">No choices available for this question.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                A detailed question-by-question review is not available for this older attempt.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default AttemptReviewPage;