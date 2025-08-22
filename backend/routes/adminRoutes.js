var express = require("express");
const {
  createQuestionSetController,
  createUserByAdminController,
  getDashboardStatsController,
  updateUserByAdminController,
  deleteUserByAdminController,
} = require("../controller/adminController");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const { adminOnlyMiddleware } = require("../middleware/RoleMiddleware");
var router = express.Router();

router.get(
  "/dashboard-stats",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  getDashboardStatsController
);

router.post(
  "/questionset/create",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  createQuestionSetController
);

router.post(
  "/user/create",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  createUserByAdminController
);

router.put(
  "/user/:id",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  updateUserByAdminController
);

router.delete(
  "/user/:id",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  deleteUserByAdminController
);

module.exports = router;