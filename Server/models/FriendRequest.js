const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  status: { type: String, enum: ['pending', 'rejected'], default: 'pending'}
}, {timestamps: true});

friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model("FriendRequest", friendRequestSchema);