import axios from "axios";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import Modal from "../Modal";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export interface QuestionSetForm {
  title: string;
  questions: {
    questionText: string;
    choices: { text: string; label: string; correctAnswer: boolean }[];
  }[];
}

function CreateQuestionSetForm() {
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error" as "error" | "success",
  });
  const navigate = useNavigate();
  const defaultValues: QuestionSetForm = {
    title: "",
    questions: [
      {
        questionText: "",
        choices: [{ text: "", label: "0", correctAnswer: false }],
      },
    ],
  };

  const methods = useForm({ defaultValues });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmitHandler = (data: QuestionSetForm) => {
    // Basic validation
    if (!data.title.trim()) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter an assessment title.",
        type: "error",
      });
      return;
    }
    for (const q of data.questions) {
      if (!q.questionText.trim()) {
        setModal({
          isOpen: true,
          title: "Validation Error",
          message: "Please ensure all questions have text.",
          type: "error",
        });
        return;
      }
      if (q.choices.length === 0) {
        setModal({
          isOpen: true,
          title: "Validation Error",
          message: `A question must have at least one choice.`,
          type: "error",
        });
        return;
      }
      if (!q.choices.some((c) => c.correctAnswer)) {
        setModal({
          isOpen: true,
          title: "Validation Error",
          message: `A question must have at least one correct answer.`,
          type: "error",
        });
        return;
      }
      for (const c of q.choices) {
        if (!c.text.trim()) {
          setModal({
            isOpen: true,
            title: "Validation Error",
            message: `Please ensure all choices have text.`,
            type: "error",
          });
          return;
        }
      }
    }

    const accessToken = localStorage.getItem("token");
    axios
      .post("https://education-university-backend.onrender.com/api/admin/questionset/create", data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        setModal({
          isOpen: true,
          title: "Success!",
          message: "Assessment Created Successfully",
          type: "success",
        });
        methods.reset(defaultValues);
        // Do not navigate immediately, wait for modal confirmation
      })
      .catch((err) => {
        console.error("Failed to create question set", err);
        setModal({
          isOpen: true,
          title: "Error",
          message: "An error occurred while creating the assessment.",
          type: "error",
        });
      });
  };

  const closeModalAndNavigate = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === "success") {
      navigate("/questionset/list");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmitHandler)}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  Create a New Assessment
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Fill in the details below to build your assessment.
                </p>

                {/* Assessment Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2"
                  >
                    Assessment Title
                  </label>
                  <input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="e.g., Advanced JavaScript Concepts"
                    className="w-full input-style"
                  />
                  {errors.title && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <hr className="my-8 border-gray-200 dark:border-gray-600" />

                {/* Questions Section */}
                <CreateQuestions />
              </div>

              <div className="flex justify-end gap-4">
                <Link
                  to="/questionset/list"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-bold py-3 px-8 rounded-full transition-colors duration-300"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModalAndNavigate}
        title={modal.title}
        type={modal.type}
      >
        {modal.message}
      </Modal>
    </>
  );
}

function CreateQuestions() {
  const { control } = useFormContext<QuestionSetForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const addQuestionHandler = () => {
    append({
      questionText: "",
      choices: [{ text: "", label: "0", correctAnswer: false }],
    });
  };

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Questions
      </h2>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border-t border-gray-200 dark:border-gray-600 pt-6"
        >
          <div className="flex justify-between items-start mb-4">
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200">
              Question {index + 1}
            </label>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors"
                aria-label="Remove Question"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <CreateChoices questionIndex={index} />
        </div>
      ))}
      <div className="flex justify-center mt-8">
        <button
          type="button"
          onClick={addQuestionHandler}
          className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 font-bold py-2 px-6 rounded-full transition-colors duration-300 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Another Question
        </button>
      </div>
    </div>
  );
}

function CreateChoices({ questionIndex }: { questionIndex: number }) {
  const { register, control } = useFormContext<QuestionSetForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices`,
  });

  const addChoiceHandler = () => {
    append({
      label: fields.length.toString(),
      text: "",
      correctAnswer: false,
    });
  };

  return (
    <div className="space-y-4">
      <textarea
        {...register(`questions.${questionIndex}.questionText`, {
          required: true,
        })}
        placeholder="Enter the question text here..."
        rows={3}
        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />

      <h4 className="font-semibold text-gray-600 dark:text-gray-300 mt-4">
        Choices
      </h4>
      <div className="space-y-3 pl-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              title="Mark as correct answer"
              {...register(
                `questions.${questionIndex}.choices.${index}.correctAnswer`
              )}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
            />
            <input
              {...register(`questions.${questionIndex}.choices.${index}.text`, {
                required: true,
              })}
              placeholder={`Choice ${index + 1}`}
              className="flex-grow input-style"
            />
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors"
                aria-label="Remove Choice"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addChoiceHandler}
        className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
      >
        + Add Another Choice
      </button>
    </div>
  );
}

export default CreateQuestionSetForm;
