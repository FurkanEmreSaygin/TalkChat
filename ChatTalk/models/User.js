const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    user_name: { type : String, required: true, unique: true},
    email: { type : String , required: true, unique: true},
    password: { type : String , required: true},
    phoneNumber: { type : String},
    profilePic: { type : String, default: ""},
    isActive: { type : Boolean , default: false},
    // For Encryption Keys
    publicKey: { type : String , default: ""}
},{
    timestamps: true
})


module.exports = mongoose.model("User", UserSchema);
