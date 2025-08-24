import React, { useState } from "react";
import type { IAttempQuestionForm } from "../../pages/QuestionSet/AttemptQuizPage";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import axios from "axios";
import Modal from "../Modal";
import { Link, useNavigate } from "react-router-dom";

export interface IAttemptQuizFinalData {
  questionSet: string;
  responses: {
    questionId: string;
    selectedChoiceIds: string[];
  }[];
}

interface IResult {
  score: number;
  total: number;
}
function AttemptQuizForm({
  questionSet,
}: {
  questionSet: IAttempQuestionForm;
}) {
  const [result, setResult] = useState<IResult | null>(null);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const navigate = useNavigate();

  const defaultValues: IAttempQuestionForm = {
    ...questionSet,
  };
  const methods = useForm({ defaultValues });

  const { handleSubmit } = methods;

  const onSubmitHandler = (data: IAttempQuestionForm) => {
    const accessToken = localStorage.getItem("token");

    const finalData: IAttemptQuizFinalData = {
      questionSet: data?._id,
      responses: (data?.questions || []).map((question) => {
        return {
          questionId: question?._id,
          selectedChoiceIds:
            (question?.choices || [])
              ?.filter((choice) => choice?.selected)
              ?.map((ch) => ch?._id)
              .filter(Boolean) ?? [],
        };
      }),
    };

    axios
      .post("http://localhost:3000/api/questions/answer/attempt", finalData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setResult(res.data.data);
      })
      .catch((err) => {
        console.error("Failed to submit assessment", err);
        setModal({
          isOpen: true,
          title: "Submission Error",
          message:
            "There was an error submitting your assessment. Please try again.",
        });
      });
  };

  const handleCancelConfirm = () => {
    navigate("/questionset/list");
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Assessment Completed!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Here's your final score:
          </p>
          <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-8">
            <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
              {result.score} / {result.total}
            </p>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-8">
            Explore more Assessments
          </p>
          <Link
            to="/questionset/list"
            className="mt-2 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors duration-300"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmitHandler)}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">
                  {questionSet.title}
                </h1>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                  Answer all questions to the best of your ability.
                </p>
              </div>

              <CreateQuestions />

              <div className="flex justify-center items-center pt-4 gap-4">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-bold py-4 px-12 rounded-full transition-colors"
                >
                  Cancel Assessment
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
                >
                  Submit Answers
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, title: "", message: "" })}
        title={modal.title}
        type="error"
      >
        {modal.message}
      </Modal>
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Are you sure?"
        type="warning"
        confirmText="Yes, Exit"
        cancelText="Stay"
      >
        Your progress will not be saved if you exit now.
      </Modal>
    </>
  );
}

function CreateQuestions() {
  const { control } = useFormContext<IAttempQuestionForm>();

  const { fields } = useFieldArray({
    control,
    name: "questions",
  });

  return (
    <div className="space-y-10">
      {fields?.map((field, index) => {
        return (
          <div
            key={field.id}
            className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              <span className="text-blue-600 dark:text-blue-400">
                Q{index + 1}:
              </span>{" "}
              {field.questionText}
            </h3>
            <CreateChoices questionIndex={index} />
          </div>
        );
      })}
    </div>
  );
}

function CreateChoices({ questionIndex }: { questionIndex: number }) {
  const { register, control, watch } = useFormContext<IAttempQuestionForm>();
  const { fields } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices`,
  });

  const watchedChoices = watch(`questions.${questionIndex}.choices`);

  return (
    <div className="flex flex-col space-y-2">
      {fields?.map((field, index) => {
        const isSelected = watchedChoices?.[index]?.selected;

        return (
          <label
            key={field.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"
            }`}
          >
            <input
              type="checkbox"
              {...register(
                `questions.${questionIndex}.choices.${index}.selected`
              )}
              className="hidden"
            />
            <span
              className={`font-semibold ${
                isSelected ? "text-white" : "text-gray-800 dark:text-gray-200"
              }`}
            >
              {field.text}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default AttemptQuizForm;
