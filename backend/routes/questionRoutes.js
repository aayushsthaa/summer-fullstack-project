var express = require("express");
const {
  listQuestionSetController,
  getQuestionSetController,
  saveAttemptedQuestionController,
  deleteQuestionSetController,
} = require("../controller/questionController");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const { adminOnlyMiddleware } = require("../middleware/RoleMiddleware");
var router = express.Router();

router.get("/set/list", validateTokenMiddleware, listQuestionSetController);
router.get("/set/:id", validateTokenMiddleware, getQuestionSetController);
router.post(
  "/answer/attempt",
  validateTokenMiddleware,
  saveAttemptedQuestionController
);
router.delete(
  "/delete/:id",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  deleteQuestionSetController
);
module.exports = router;