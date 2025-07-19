import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import loginSchema from "../utils/loginSchema.js";
import registerSchema from "../utils/registerSchema.js";
import logger from '../utils/logger.js';


const RegisterController = async (req, res) => {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });

    const { username, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: ["Email already exists"],
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic || "", // default "" from schema
        bio: newUser.bio || "", // default "Available" from schema
        status: newUser.status || "offline", // default "offline"
        lastSeen: newUser.lastSeen || null, // default Date.now
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errors: ["Internal Server Error"],
      });
    }
  }
};

const LoginController = async (req, res) => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
        errors: ["Email not found"],
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
        errors: ["Invalid password"],
      });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || "", // default to empty string
        bio: user.bio || "", // default to empty string
        status: user.status || "", // default to empty string
        lastSeen: user.lastSeen || null, // optional: null fallback
      },
    });
  } catch (error) {
    logger.error(error)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errors: ["Internal Server Error"],
      });
    }
  }
};

const LogoutController = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: ["Internal Server Error"],
    });
  }
};

const me = async (req, res) => {
  try {
    const { _id, username, email, profilePic, status, lastSeen, bio } =
      req.user;

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        _id,
        username,
        email,
        profilePic,
        status,
        lastSeen,
        bio,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: ["Internal Server Error"],
    });
  }
};

export { RegisterController, LoginController, LogoutController, me };
