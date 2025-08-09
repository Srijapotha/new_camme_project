const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null, // Top-level comments have no parent
    },
    replies: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);