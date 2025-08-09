const mongoose = require("mongoose");


const BlackerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    userPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Postcreate",
    },
    postUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["OnGoing", "Accept TedBlack", "Reject TedBlack"],
        default: "OnGoing",
    },
    notiFied: {
        type: Number,
        default: 0,
    },
    agree: {
        type: Number,
        default: 0,
    },
    disAgree: {
        type: Number,
        default: 0,
    },
    reasone: {
        type: String,
        required: false,
    },
    hashTags: {
        type: String,
        required: false,
    },
    notifyUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    agreeUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    disAgreeUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, { timestamps: true })


module.exports = mongoose.model("TedBlackers", BlackerSchema);