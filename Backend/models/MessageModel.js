import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // for seen/read receipts
  attachments: [{ type: String }], // for image/file messages
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDeleted: { type: Boolean, default: false }, // for global delete
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
},
{
  timestamps: true,
});

export default mongoose.model("Message", MessageSchema);