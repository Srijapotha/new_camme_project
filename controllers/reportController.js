const Report = require('../models/Report');
const Post = require('../models/PostModel');
const Comment = require('../models/comment');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

exports.submitReport = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
      if (!verification.success) {
        return res.status(200).json(verification);
      }
    const { reportedPost, commentId, reason } = req.body;
    const userId = req.user.userId; // Assuming req.user is populated by a JWT middleware

    if (!reason || (!reportedPost && !commentId)) {
      return res.status(400).json({ success: false, message: 'Missing required fields: reason and either postId or commentId' });
    }

    const newReport = new Report({
      reporter: userId,
      reportedPost: reportedPost,
      reportedComment: commentId,
      reason: reason,
    });

    await newReport.save();

    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPendingReports = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
      if (!verification.success) {
        return res.status(200).json(verification);
      }
    const allReports = await Report.find({status: 'pending'})
      .populate('reporter', 'userName')
      .populate('reportedPost', 'caption')
      .populate('reportedComment', 'text');

    res.status(200).json({ success: true, reports: allReports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    // const { id } = req.params;
    const verification = await verifyUserTokenAndEmail(req);
      if (!verification.success) {
        return res.status(200).json(verification);
      }
    const { status, takeActionOnContent = false, id } = req.body; // 'dismiss' or 'resolve'

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status === 'resolved') {
      report.status = 'resolved';
      if (takeActionOnContent) {
        if (report.reportedPost) {
          await Post.findByIdAndDelete(report.reportedPost);
        } else if (report.reportedComment) {
          await Comment.findByIdAndDelete(report.reportedComment);
        }
      }
    } else if (status === 'dismissed') {
      report.status = 'dismissed';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action specified' });
    }

    await report.save();
    res.status(200).json({ success: true, message: 'Report updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};