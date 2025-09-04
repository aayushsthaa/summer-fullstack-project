const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Profile = require("../model/ProfileModel");
const AnswerModel = require("../model/AnswerModel");

const saltRounds = 10;
const JWT_SECRET = process.env.AUTH_SECRET_KEY || "dev_secret_change_me";

// Get all users
async function getUser(req, res) {
  try {
    const userList = await User.find();
    res.status(200).json({
      message: "User List",
      users: userList,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err });
  }
}

// Register user
async function createUser(req, res) {
  const { name, username, email, password } = req.body || {};
  try {
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    const data = {
      name,
      email,
      username,
      password: encryptedPassword,
    };

    const user = new User(data);
    await user.save();

    const profileData = {
      user: user._id,
      bio: "",
      profilePicture: "",
      skills: [],
      github: "",
      linkedin: "",
      portfolioUrl: "",
    };
    const profile = new Profile(profileData);
    await profile.save();

    res.status(201).json({
      message: "User Created Successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error, Please try again",
      error: err,
    });
  }
}

// Login user (email + password)
async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // If your schema has password: { select: false }, keep +password.
    // Otherwise it's harmless.
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // standardized to "token" for frontend to read
    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Login failed", error: err });
  }
}

// Google OAuth login handler
async function googleAuth(req, res) {
  const { profile } = req.body;

  if (!profile || !profile.email || !profile.name) {
    return res.status(400).json({ message: "Invalid Google profile data" });
  }

  try {
    // Check if user exists by email
    let user = await User.findOne({ email: profile.email });

    // If not, create new user
    if (!user) {
      user = new User({
        name: profile.name,
        email: profile.email,
        username: profile.email.split("@")[0], // Auto-generate username
        role: "professional", // default role
      });
      await user.save();
      
      // Also create a profile for the new user
      const profileData = {
        user: user._id,
        bio: "",
        profilePicture: "",
        skills: [],
        github: "",
        linkedin: "",
        portfolioUrl: "",
      };
      const newProfile = new Profile(profileData);
      await newProfile.save();
    }

    // Generate JWT token for session
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(500).json({ message: "Google login failed", error: err });
  }
}

async function updateProfileMeController(req,res){
  const { id } = req.user;
  const { name, bio, github, linkedin, portfolioUrl, skills } = req.body;

  try {
      // Find the user and profile
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Update user's name if provided
      if (name) {
          user.name = name;
          await user.save();
      }

      // Find and update profile, or create if it doesn't exist
      let profile = await Profile.findOne({ user: id });
      if (!profile) {
          profile = new Profile({ user: id });
      }

      profile.bio = bio ?? profile.bio;
      profile.github = github ?? profile.github;
      profile.linkedin = linkedin ?? profile.linkedin;
      profile.portfolioUrl = portfolioUrl ?? profile.portfolioUrl;
      profile.skills = skills ?? profile.skills;

      await profile.save();

      res.status(200).json({
          message: "Profile updated successfully",
          user,
          profile
      });
  } catch (error) {
      console.error("Profile Update Error:", error);
      res.status(500).json({ message: "Failed to update profile", error });
  }
}
async function viewMyProfileController(req,res){
  const { id } = req.user;
  try {
      const user = await User.findById(id).select("-password");
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const profile = await Profile.findOne({ user: id });

      // Calculate stats
      const allAttempts = await AnswerModel.find({ user: id });
      let totalPercentage = 0;
      let highestPercentage = 0;
      if (allAttempts.length > 0) {
          allAttempts.forEach(attempt => {
              const percentage = attempt.total ? (attempt.score / attempt.total) * 100 : 0;
              totalPercentage += percentage;
              if (percentage > highestPercentage) highestPercentage = percentage;
          });
      }
      const stats = {
          totalAttempts: allAttempts.length,
          averageScore: allAttempts.length > 0 ? Math.round(totalPercentage / allAttempts.length) : 0,
          highestScore: Math.round(highestPercentage),
      };
      
      res.status(200).json({ user, profile, stats });
  } catch (error) {
      console.error("View Profile Error:", error);
      res.status(500).json({ message: "Failed to fetch profile", error });
  }
}
async function viewMyQuizAttemptsController(req,res){
    const { id: userId } = req.user;
    try {
        const attempts = await AnswerModel.find({ user: userId })
            .sort({ submittedAt: -1 })
            .select('questionSet questionSetTitle score total submittedAt');

        const formattedAttempts = attempts.map(attempt => ({
            _id: attempt._id,
            questionSetId: attempt.questionSet,
            questionSet: {
                title: attempt.questionSetTitle,
            },
            score: attempt.score,
            total: attempt.total,
            submittedAt: attempt.submittedAt,
        }));

        res.status(200).json(formattedAttempts);
    } catch (error) {
        console.error("Fetch Quiz Attempts Error:", error);
        res.status(500).json({ message: "Failed to fetch quiz attempts", error });
    }
}

async function getQuizAttemptDetailsController(req, res) {
    const { attemptId } = req.params;
    const { id: userId } = req.user;
    try {
        const attempt = await AnswerModel.findOne({ _id: attemptId, user: userId });
        if (!attempt) {
            return res.status(404).json({ message: "Attempt not found or you do not have permission to view it." });
        }
        res.status(200).json(attempt);
    } catch (error) {
        console.error("Fetch Quiz Attempt Details Error:", error);
        res.status(500).json({ message: "Failed to fetch quiz attempt details", error });
    }
}

async function viewProfileofUserController(req,res){
  const { id } = req.params;
  try {
      const user = await User.findById(id).select("-password");
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const profile = await Profile.findOne({ user: id });

      // Fetch last 5 quiz attempts
      const attempts = await AnswerModel.find({ user: id })
          .sort({ submittedAt: -1 })
          .limit(5)
          .populate('questionSet', 'title')
          .select('questionSet score total submittedAt');

      // Calculate stats
      const allAttempts = await AnswerModel.find({ user: id });
      let totalPercentage = 0;
      let highestPercentage = 0;
      if (allAttempts.length > 0) {
          allAttempts.forEach(attempt => {
              const percentage = attempt.total ? (attempt.score / attempt.total) * 100 : 0;
              totalPercentage += percentage;
              if (percentage > highestPercentage) highestPercentage = percentage;
          });
      }
      const stats = {
          totalAttempts: allAttempts.length,
          averageScore: allAttempts.length > 0 ? Math.round(totalPercentage / allAttempts.length) : 0,
          highestScore: Math.round(highestPercentage),
      };
      
      res.status(200).json({ user, profile, attempts, stats });
  } catch (error) {
      console.error("View User Profile Error:", error);
      res.status(500).json({ message: "Failed to fetch user profile", error });
  }
}

async function listProfessionalsController(req, res) {
  try {
    // Find users with role 'professional', sorted by newest first, and populate their profile
    const professionals = await User.find({ role: 'professional' }).sort({ _id: -1 }).select('-password').lean();
    const profiles = await Profile.find({ user: { $in: professionals.map(p => p._id) } }).lean();

    const professionalsWithProfiles = professionals.map(user => {
        const profile = profiles.find(p => p.user.toString() === user._id.toString());
        return {
            ...user,
            profile: profile || {}
        };
    });

    res.status(200).json(professionalsWithProfiles);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch professionals', error: err });
  }
}

module.exports = {
  getUser,
  createUser,
  loginUser,
  googleAuth,
  updateProfileMeController,
  viewMyProfileController,
  viewMyQuizAttemptsController,
  getQuizAttemptDetailsController,
  viewProfileofUserController,
  listProfessionalsController,
};