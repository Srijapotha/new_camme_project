const Comment = require('../models/comment');
const Post = require('../models/PostModel'); // Assuming you have a Post model


exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const postedBy = req.user.userId ; // User ID from the JWT token

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const newComment = new Comment({
            text,
            postedBy,
            post: postId
        });

        await newComment.save();
        
        // Optionally, add the comment ID to the post's comments array
        // post.comments.push(newComment._id);
        // await post.save();

        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.addReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const postedBy = req.user.userId;

        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ success: false, message: 'Parent comment not found' });
        }

        const newReply = new Comment({
            text,
            postedBy,
            post: parentComment.post,
            parentComment: commentId,
        });

        await newReply.save();

        // Add the reply's ID to the parent comment's replies array
        parentComment.replies.push(newReply._id);
        await parentComment.save();

        res.status(201).json({ success: true, data: newReply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId, parentComment: null })
            .populate('postedBy', 'username profilePic') // Populate user details
            .populate({
                path: 'replies',
                populate: {
                    path: 'postedBy',
                    select: 'username profilePic'
                }
            })
            .sort({ createdAt: -1 }); // Newest comments first

        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        const isLiked = comment.likes.includes(userId);

        if (isLiked) {
            // User has already liked, so unlike it
            comment.likes.pull(userId);
        } else {
            // User hasn't liked, so like it
            comment.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({ success: true, data: comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};