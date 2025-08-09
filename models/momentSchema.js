const mongoose = require('mongoose');

const momentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    descripition: {
        type: String,
        required: true
    },
    is_closeFriends: {
        type: Boolean,
        default: true // means true for friendsOnly and false for public
    },
    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            comment: {
                type: String,
                required: true,
            },
            replies: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    reply: {
                        type: String,
                        required: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        },
    ],
    expressions: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours = 86400 seconds
    }
});

module.exports = mongoose.model('Moment', momentSchema);
