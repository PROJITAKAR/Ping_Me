import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true, // hash before saving!
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic: {
    type: String,
    default: "", // you can use a default profile image here
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
  lastSeen: { type: Date, default: Date.now }, // for 'last seen' feature
  bio: { type: String, default: "Available" }, // short status or about section
});

export default mongoose.model("User", UserSchema);