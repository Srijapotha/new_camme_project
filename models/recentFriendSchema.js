const mongoose = require("mongoose")


const recentModelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recentId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    status: {
        type: String,
        enum: ["unfriend", "cancleRequest"],
        default: "unfriend"
    }
});



module.exports = mongoose.model("recent", recentModelSchema)