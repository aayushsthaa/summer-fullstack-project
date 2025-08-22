const QuestionSet = require("../model/QuestionSetModel");
const User = require("../model/userModel");
const Profile = require("../model/ProfileModel");
const AnswerModel = require("../model/AnswerModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function createQuestionSetController(req, res) {
  const data = req.body;
  const { id, role } = req.user;

  const finalData = {
    ...data,
    createdBy: id,
  };

  const createSet = new QuestionSet(finalData);
  await createSet.save();

  res.status(201).json({
    message: "Question Set Created Successfully",
  });
}

async function createUserByAdminController(req, res) {
  const { name, username, email, password, role, bio, skills, github, linkedin, portfolioUrl } = req.body;
  try {
    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role !== "admin" && role !== "professional") {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or username already exists" });
    }

    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    const data = {
      name,
      email,
      username,
      password: encryptedPassword,
      role,
    };

    const user = new User(data);
    await user.save();

    const profileData = {
      user: user._id,
      bio: bio || "",
      profilePicture: "",
      skills: skills || [],
      github: github || "",
      linkedin: linkedin || "",
      portfolioUrl: portfolioUrl || "",
    };
    const profile = new Profile(profileData);
    await profile.save();

    res.status(201).json({
      message: "User Created Successfully by Admin",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error, Please try again",
      error: err,
    });
  }
}

async function getDashboardStatsController(req, res) {
  try {
    const userCount = await User.countDocuments();
    const quizCount = await QuestionSet.countDocuments();

    res.status(200).json({
      stats: { userCount, quizCount },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
}

async function updateUserByAdminController(req, res) {
    const { id } = req.params;
    const { name, username, email, role, bio, skills, github, linkedin, portfolioUrl } = req.body;

    try {
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        if (email && email !== userToUpdate.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: "Email is already in use." });
        }
        if (username && username !== userToUpdate.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) return res.status(400).json({ message: "Username is already in use." });
        }

        userToUpdate.name = name ?? userToUpdate.name;
        userToUpdate.username = username ?? userToUpdate.username;
        userToUpdate.email = email ?? userToUpdate.email;
        userToUpdate.role = role ?? userToUpdate.role;
        await userToUpdate.save();

        let profileToUpdate = await Profile.findOne({ user: id });
        if (!profileToUpdate) {
            profileToUpdate = new Profile({ user: id });
        }

        profileToUpdate.bio = bio ?? profileToUpdate.bio;
        profileToUpdate.skills = skills ?? profileToUpdate.skills;
        profileToUpdate.github = github ?? profileToUpdate.github;
        profileToUpdate.linkedin = linkedin ?? profileToUpdate.linkedin;
        profileToUpdate.portfolioUrl = portfolioUrl ?? profileToUpdate.portfolioUrl;
        await profileToUpdate.save();

        res.status(200).json({ 
            message: "User and profile updated successfully", 
            user: userToUpdate,
            profile: profileToUpdate
        });

    } catch (error) {
        console.error("Admin User Update Error:", error);
        res.status(500).json({ message: "Failed to update user", error });
    }
}


async function deleteUserByAdminController(req, res) {
    const { id } = req.params;

    if (req.user.id === id) {
        return res.status(403).json({ message: "Admins cannot delete their own account." });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        await Profile.deleteOne({ user: id });
        await AnswerModel.deleteMany({ user: id });
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: "User deleted successfully." });

    } catch (error) {
        console.error("Admin User Delete Error:", error);
        res.status(500).json({ message: "Failed to delete user.", error });
    }
}

module.exports = {
  createQuestionSetController,
  createUserByAdminController,
  getDashboardStatsController,
  updateUserByAdminController,
  deleteUserByAdminController,
};