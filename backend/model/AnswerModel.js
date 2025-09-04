const { mongoose } = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  questionSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionSet",
    required: true,
  },
  questionSetTitle: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      selectedChoiceIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      ],
    },
  ],
  score: { type: Number, default: 0 }, // Number of correct answers
  total: { type: Number, default: 0 }, // Total questions in this attempt
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const AnswerModel = mongoose.model("Answer", AnswerSchema);
module.exports = AnswerModel;