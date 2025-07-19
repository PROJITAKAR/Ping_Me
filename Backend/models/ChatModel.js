import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String }, // only for group chats
    isGroup: { type: Boolean, default: false, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // for preview
    description: { type: String }, // optional group info
    groupProfilePic: {type: String}, // group profile image
  },
  { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
