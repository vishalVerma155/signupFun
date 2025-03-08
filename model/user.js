const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
