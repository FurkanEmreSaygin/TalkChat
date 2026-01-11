const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profilePic: { type: String, default: "" },

    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        encryptedKey: { type: String, required: true },
        role: { type: String, enum: ["admin", "member"], default: "member" },
      },
    ],
    
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publicGroupKey: { type: String, required: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Groups", groupSchema);
