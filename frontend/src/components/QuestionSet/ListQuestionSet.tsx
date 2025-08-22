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

function ListQuestionSetForm() {
  const [questionSets, setQuestionSet] = useState<IListQuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { isAuth, setAuthState, role } = useContext(AuthContext);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });
  const handleDeleteQuestionSet = async (id: string) => {
    try {
      const accessToken = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/questions/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      navigate("/questionset/list");
    } catch (error) {
      console.error("Failed to delete question set:", error);
    }
  };
  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      axios
        .get("http://localhost:3000/api/questions/set/list", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setQuestionSet(response?.data?.questionSet);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch question sets:", error);
          setIsLoading(false);
        });
    }

    fetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          Loading Question Sets...
        </p>
      </div>
    );
  }

  if (questionSets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4 gap-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          No Quizzes Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          It looks like there are no quizzes available at the moment.
        </p>
        {isAuth && role === "admin" && (
          <NavLink
            to="/admin/questionset/create"
            className="hover:text-gray-200 text-white transition-colors duration-300 px-4 py-2 rounded-2xl bg-blue-700"
          >
            Create Question
          </NavLink>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-extrabold text-center mb-10 text-blue-700 dark:text-white">
            All Question Sets
          </h2>
          {isAuth && role === "admin" && (
            <NavLink
              to="/admin/questionset/create"
              className="hover:text-gray-200 text-white transition-colors duration-300 px-4 py-2 rounded-2xl bg-blue-700"
            >
              Create Question
            </NavLink>
          )}
        </div>
        <div className="space-y-4">
          {questionSets.map((question) => {
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

                  <div className="w-full sm:w-auto flex-shrink-0 mt-4 sm:mt-0 flex gap-3 align-center">
                    <button
                      className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-5 rounded-full hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
                      aria-label={`Take test: ${question.title}`}
                    >
                      <span>Take Test</span>
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
                        onClick={() => handleDeleteQuestionSet(question._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ListQuestionSetForm;
