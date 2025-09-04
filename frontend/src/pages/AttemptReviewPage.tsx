import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces for the detailed data structure
interface IChoice {
    _id: string;
    text: string;
    correctAnswer: boolean;
}

interface IQuestion {
    _id: string;
    questionText: string;
    choices: IChoice[];
}

interface IQuestionSet {
    _id: string;
    title: string;
    questions: IQuestion[];
}

interface IResponse {
    questionId: string;
    selectedChoiceIds: string[];
    _id: string; // Mongoose adds this
}

interface IAttemptDetails {
    _id:string;
    questionSet: IQuestionSet;
    questionSetTitle: string;
    responses: IResponse[];
    score: number;
    submittedAt: string;
    total: number;
    user: string;
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{attempt.questionSetTitle}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Completed on {new Date(attempt.submittedAt).toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-gray-700/50 rounded-lg p-8">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Final Score</p>
                        <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{attempt.score} <span className="text-4xl text-gray-400 dark:text-gray-500">/ {attempt.total}</span></p>
                    </div>
                    
                    <div className="pt-4">
                        <Link to="/profile/me" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 inline-block">
                            Back to Profile
                        </Link>
                    </div>
                </div>

                {/* Detailed Review Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detailed Review</h2>
                    <div className="space-y-8">
                        {attempt.questionSet.questions.map((question, index) => {
                            const userResponse = attempt.responses.find(r => r.questionId === question._id);
                            const selectedChoiceIds = userResponse?.selectedChoiceIds || [];

                            return (
                                <div key={question._id} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        <span className="font-bold">Q{index + 1}:</span> {question.questionText}
                                    </h3>
                                    <ul className="mt-4 space-y-3">
                                        {question.choices.map(choice => {
                                            const isSelected = selectedChoiceIds.includes(choice._id);
                                            const isCorrect = choice.correctAnswer;
                                            
                                            let choiceClasses = "flex items-center p-3 rounded-lg border ";
                                            let icon = null;

                                            if (isCorrect) { // Correct answer
                                                if (isSelected) {
                                                    choiceClasses += "bg-green-100/70 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-200";
                                                    icon = <CheckCircleIcon/>;
                                                } else {
                                                    choiceClasses += "bg-green-50/50 dark:bg-green-900/20 border-green-400 border-dashed text-gray-700 dark:text-gray-300";
                                                    icon = <InformationCircleIcon className="text-green-600"/>; // This was the correct answer
                                                }
                                            } else { // Incorrect answer
                                                if (isSelected) {
                                                    choiceClasses += "bg-red-100/70 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-300";
                                                    icon = <XCircleIcon/>;
                                                } else {
                                                    choiceClasses += "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400";
                                                }
                                            }
                                            
                                            return (
                                                <li key={choice._id} className={choiceClasses}>
                                                    <span className="mr-3 flex-shrink-0 w-5 h-5">{icon}</span>
                                                    <span>{choice.text}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const InformationCircleIcon = ({className = ''}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;


export default AttemptReviewPage;
