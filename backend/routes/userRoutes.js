var express = require('express');
const {
  getUser,        // list users (protected)
  createUser,     // register
  googleAuth,     // google oauth
  loginUser,      // email/password login
  updateProfileMeController, 
  viewMyProfileController,
  viewProfileofUserController,
  viewMyQuizAttemptsController
} = require('../controller/userController');

const { validateTokenMiddleware } = require('../middleware/AuthMiddleware');
const { adminOnlyMiddleware } = require('../middleware/RoleMiddleware');
var router = express.Router();

// Register
router.post('/create', createUser);

// Google OAuth
router.post('/auth/google', googleAuth);

// Email/password login
router.post('/login', loginUser);

router.get('/list', validateTokenMiddleware, adminOnlyMiddleware, getUser);

// Profile routes
router.get('/profile/me', validateTokenMiddleware, viewMyProfileController);
router.put('/profile/me', validateTokenMiddleware, updateProfileMeController);
router.get('/profile/me/attempts', validateTokenMiddleware, viewMyQuizAttemptsController);

// Admin routes
router.get('/profile/:id', validateTokenMiddleware, adminOnlyMiddleware, viewProfileofUserController);

module.exports = router;