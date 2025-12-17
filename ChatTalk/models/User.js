const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    userName: { type : String, required: true, unique: true, min: 3, max: 20},
    email: { type : String , required: true, unique: true, max: 50},
    password: { type : String , required: true},
    phoneNumber: { type : String},
    profilePic: { type : String, default: ""},
    isActive: { type : Boolean , default: true},
    isAdmin: { type : Boolean , default: false},
    // For Encryption Keys
    publicKey: { type : String , default: ""},
    encryptedPrivateKey: { type: String, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref:"User"}]
},{
    timestamps: true
})


module.exports = mongoose.model("User", UserSchema);
