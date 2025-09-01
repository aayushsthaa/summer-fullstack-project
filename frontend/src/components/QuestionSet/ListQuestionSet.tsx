import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../App";
import Modal from "../../components/Modal";

export interface IListQuestionSet {
  _id: string;
  title: string;
  questionCount: number;
  createdBy?: string;
}

interface ISkill {
    name: string;
    level: string;
}

interface IUserProfile {
    profile: {
        skills: ISkill[];
    }
}

function ListQuestionSet() {
  const [suggestedSets, setSuggestedSets] = useState<IListQuestionSet[]>([]);
  const [otherSets, setOtherSets] = useState<IListQuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { isAuth, role } = useContext(AuthContext);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', title: '' });
  const [notificationModal, setNotificationModal] = useState({
      isOpen: false,
      title: "",
      message: "",
      type: "error" as "success" | "error"
  });

  const openDeleteModal = (id: string, title: string) => {
    setDeleteModal({ isOpen: true, id, title });
  };

  const handleConfirmDelete = async () => {
      if (!deleteModal.id) return;

      try {
          const accessToken = localStorage.getItem("token");
          await axios.delete(`http://localhost:3000/api/questions/delete/${deleteModal.id}`, {
              headers: {
                  Authorization: `Bearer ${accessToken}`,
              },
          });
          setSuggestedSets(prevSets => prevSets.filter(set => set._id !== deleteModal.id));
          setOtherSets(prevSets => prevSets.filter(set => set._id !== deleteModal.id));
          setNotificationModal({
              isOpen: true,
              title: "Success",
              message: `Assessment "${deleteModal.title}" deleted successfully.`,
              type: "success"
          });
      } catch (error: any) {
          console.error("Failed to delete question set:", error);
          setNotificationModal({
              isOpen: true,
              title: "Error",
              message: error.response?.data?.message || "Failed to delete assessment.",
              type: "error"
          });
      } finally {
        setDeleteModal({ isOpen: false, id: '', title: '' });
      }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
        setIsLoading(true);
        const headers = { Authorization: `Bearer ${accessToken}` };
        try {
            const [setsRes, profileRes] = await Promise.all([
                axios.get("http://localhost:3000/api/questions/set/list", { headers }),
                axios.get("http://localhost:3000/users/profile/me", { headers })
            ]);

            const allSets: IListQuestionSet[] = setsRes.data.questionSet;
            const userProfile: IUserProfile = profileRes.data;
            
            const userSkills = userProfile.profile?.skills?.map(skill => skill.name.toLowerCase()) || [];

            if (userSkills.length > 0 && role !== 'admin') {
                const suggested: IListQuestionSet[] = [];
                const others: IListQuestionSet[] = [];
                allSets.forEach(set => {
                    const isSuggested = userSkills.some(skill => set.title.toLowerCase().includes(skill));
                    if (isSuggested) {
                        suggested.push(set);
                    } else {
                        others.push(set);
                    }
                });
                setSuggestedSets(suggested);
                setOtherSets(others);
            } else {
                setSuggestedSets([]);
                setOtherSets(allSets);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    fetchData();
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          Loading Assessments...
        </p>
      </div>
    );
  }

  const allSetsCount = suggestedSets.length + otherSets.length;

  if (allSetsCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4 gap-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          No Assessments Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          It looks like there are no assessments available at the moment.
        </p>
        {isAuth && role === "admin" && (
          <NavLink
            to="/admin/questionset/create"
            className="hover:text-gray-200 text-white transition-colors duration-300 px-4 py-2 rounded-2xl bg-blue-700"
          >
            Create Assessment
          </NavLink>
        )}
      </div>
    );
  }
  
  const AssessmentCard = ({ question }: { question: IListQuestionSet }) => {
    const takeQuizHandler = () => {
        navigate(`/questionset/${question._id}/attempt`);
    };
    return (
        <div
            key={question._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer"
            onClick={takeQuizHandler}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-gray-700 p-3 rounded-lg">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
                </svg>
            </div>

            <div className="flex-grow">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                {question.title}
                </h3>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span>{question.questionCount} Questions</span>
                {question.createdBy && (
                    <>
                    <span className="hidden sm:inline">&middot;</span>
                    <span>Created by: {question.createdBy}</span>
                    </>
                )}
                </div>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0 mt-4 sm:mt-0 flex gap-3 items-center">
                <button
                className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-5 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
                aria-label={`Take test: ${question.title}`}
                >
                <span>Take Assessment</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                    />
                </svg>
                </button>
                {isAuth && role === "admin" && (
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(question._id, question.title);
                    }}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    aria-label={`Delete assessment: ${question.title}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                )}
            </div>
            </div>
        </div>
    );
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-extrabold text-blue-700 dark:text-white">
            Assessments
          </h2>
          {isAuth && role === "admin" && (
            <NavLink
              to="/admin/questionset/create"
              className="hover:text-gray-200 text-white transition-colors duration-300 px-4 py-2 rounded-2xl bg-blue-700"
            >
              Create Assessment
            </NavLink>
          )}
        </div>

        {suggestedSets.length > 0 && (
            <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Suggested For You</h3>
                <div className="space-y-4">
                    {suggestedSets.map((question) => <AssessmentCard key={question._id} question={question} />)}
                </div>
            </div>
        )}
        
        <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {suggestedSets.length > 0 ? "Other Assessments" : "All Assessments"}
            </h3>
            {otherSets.length > 0 ? (
                 <div className="space-y-4">
                    {otherSets.map((question) => <AssessmentCard key={question._id} question={question} />)}
                 </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No other assessments found.</p>
                </div>
            )}
        </div>
      </div>
    </div>
    <Modal
      isOpen={deleteModal.isOpen}
      onClose={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
      onConfirm={handleConfirmDelete}
      title="Confirm Deletion"
      type="warning"
      confirmText="Delete"
    >
      Are you sure you want to delete the assessment "<strong>{deleteModal.title}</strong>"? This action cannot be undone.
    </Modal>
    <Modal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal({ isOpen: false, title: "", message: "", type: "error" })}
        title={notificationModal.title}
        type={notificationModal.type}
    >
        {notificationModal.message}
    </Modal>
    </>
  );
}

export default ListQuestionSet;
