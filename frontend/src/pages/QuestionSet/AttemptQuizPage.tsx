import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AttemptQuizForm from "../../components/QuestionSet/AttemptQuizForm";

export interface IAttempQuestionForm {
  _id: string;
  title: string;
  questions: IQuestion[];
  createdBy: {
    _id: string;
    name: string;
  };
  __v: number;
}

export interface IQuestion {
  questionText: string;
  choices: IChoice[];
  _id: string;
}

export interface IChoice {
  label: string;
  text: string;
  _id: string;
  selected?: boolean;
}

function AttemptQuizPage() {
  const { id } = useParams();

  const [questionSets, setQuestionSet] = useState<IAttempQuestionForm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken || !id) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      axios
        .get(`http://localhost:3000/api/questions/set/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setQuestionSet(response?.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch quiz data:", error);
          setIsLoading(false);
        });
    }

    fetchData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300 text-lg">Loading Quiz...</p>
      </div>
    );
  }

  return (
    <div>
      {questionSets ? <AttemptQuizForm questionSet={questionSets} /> : <p className="text-center mt-10">Quiz not found or could not be loaded.</p>}
    </div>
  );
}

export default AttemptQuizPage;