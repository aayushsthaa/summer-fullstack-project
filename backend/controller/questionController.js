
const AnswerModel = require("../model/AnswerModel");
const QuestionSet = require("../model/QuestionSetModel");

async function listQuestionSetController(req, res) {
  try {
    const questionSet = await QuestionSet.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: {
          path: "$creator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          questionCount: { $size: { $ifNull: ["$questions", []] } },
          createdBy: "$creator.name",
        },
      },
    ]);

    return res.json({
      questionSet: questionSet,
    });
  } catch (error) {
    console.error("Error in listQuestionSetController:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to list question sets." });
    }
  }
}

async function getQuestionSetController(req, res) {
  try {
    const { id } = req.params;
    const questionSet = await QuestionSet.findById(id)
      .populate("createdBy", "name")
      .select("-questions.choices.correctAnswer");

    if (!questionSet) {
      return res.status(404).json({ message: "Question set not found" });
    }

    return res.json(questionSet);
  } catch (error) {
    console.error("Error in getQuestionSetController:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to get question set." });
    }
  }
}

async function saveAttemptedQuestionController(req, res) {
  try {
    const { questionSet: questionSetId, responses } = req.body;
    const { id: userId } = req.user;

    const questionSet = await QuestionSet.findById(questionSetId).select(
      "questions._id questions.choices._id questions.choices.correctAnswer"
    );

    if (!questionSet)
      return res.status(404).json({ message: "QuestionSet not found" });

    const result = (responses || []).reduce(
      (acc, current) => {
        const questions = Array.isArray(questionSet?.questions)
          ? questionSet.questions
          : Array.isArray(questionSet)
          ? questionSet
          : [];

        // 1) find the question in this set
        const q = questions.find(
          (qn) => String(qn._id) === String(current.questionId)
        );
        if (!q) return acc; // skip unknown question ids

        // 2) build the list of correct choice ids using reduce
        const correctIds = (q.choices || []).reduce((ids, c) => {
          if (c?.correctAnswer) ids.push(String(c._id));
          return ids;
        }, []);

        // 3) count how many SELECTED are actually CORRECT (using find)
        const selected = current.selectedChoiceIds || [];
        const selectedAreCorrectCount = selected.reduce((cnt, selId) => {
          const hit =
            correctIds.find((cid) => cid === String(selId)) !== undefined;
          return cnt + (hit ? 1 : 0);
        }, 0);

        // 4) count how many CORRECT were actually SELECTED (using find)
        const correctSelectedCount = correctIds.reduce((cnt, cid) => {
          const hit =
            selected.find((selId) => String(selId) === cid) !== undefined;
          return cnt + (hit ? 1 : 0);
        }, 0);

        // exact match if:
        //  - every selected is correct, AND
        //  - every correct was selected, AND
        //  - lengths line up on both sides
        const allSelectedAreCorrect =
          selectedAreCorrectCount === selected.length;
        const allCorrectWereSelected =
          correctSelectedCount === correctIds.length;
        const isCorrect = allSelectedAreCorrect && allCorrectWereSelected;

        acc.total += 1;
        if (isCorrect) acc.score += 1;

        // optional per-question detail (nice for review UI)
        acc.details.push({
          questionId: String(q._id),
          selectedChoiceIds: selected.map(String),
          isCorrect,
        });

        return acc;
      },
      { score: 0, total: 0, details: [] }
    );

    const saveAnswerQuestion = await new AnswerModel({
      questionSet: questionSetId,
      user: userId,
      responses,
      score: result.score,
      total: result.total,
    });

    await saveAnswerQuestion.save();
    return res.status(201).json({
      message: "Graded",
      data: {
        score: result.score,
        total: result.total,
        responses: result.responses,
      },
    });
  } catch (error) {
    console.error("Error in saveAttemptedQuestionController:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Failed to save question attempt." });
    }
  }
}

async function deleteQuestionSetController(req, res) {
  try {
    const { id } = req.params;
    const questionSet = await QuestionSet.findById(id);
    if (!questionSet) {
      return res.status(404).json({ message: "Question set not found" });
    }
    await QuestionSet.findByIdAndDelete(id);
    await AnswerModel.deleteMany({ questionSet: id });

    return res.status(200).json({ message: "Question set deleted successfully" });
  } catch (error) {
    console.error("Error in deleteQuestionSetController:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to delete question set." });
    }
  }
}

module.exports = {
  listQuestionSetController,
  getQuestionSetController,
  deleteQuestionSetController,
  saveAttemptedQuestionController,
};
