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
      // role, googleId etc. can be added if your schema supports them
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

// Auth middleware for protected routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


async function updateProfileMeController(req,res){
  const { id } = req.user;
  const { name, bio, github, linkedin, portfolioUrl } = req.body;

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
      
      res.status(200).json({ user, profile });
  } catch (error) {
      console.error("View Profile Error:", error);
      res.status(500).json({ message: "Failed to fetch profile", error });
  }
}
async function viewMyQuizAttemptsController(req,res){
    const { id: userId } = req.user;
    try {
        const attempts = await AnswerModel.find({ user: userId })
            .sort({ submittedAt: -1 }) // Sort by most recent
            .limit(10) // Limit to the last 10 attempts
            .populate('questionSet', 'title') // Populate the title from the QuestionSet model
            .select('questionSet score total submittedAt'); // Select only needed fields

        res.status(200).json(attempts);
    } catch (error) {
        console.error("Fetch Quiz Attempts Error:", error);
        res.status(500).json({ message: "Failed to fetch quiz attempts", error });
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
      
      res.status(200).json({ user, profile });
  } catch (error) {
      console.error("View User Profile Error:", error);
      res.status(500).json({ message: "Failed to fetch user profile", error });
  }
}

module.exports = {
  getUser,
  createUser,
  loginUser,
  googleAuth,
  authMiddleware,
  updateProfileMeController,
  viewMyProfileController,
  viewMyQuizAttemptsController,
  viewProfileofUserController,
};