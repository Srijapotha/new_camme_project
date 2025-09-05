const Report = require('../models/Report');
const Post = require('../models/PostModel');
const Comment = require('../models/comment');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

// exports.submitReport = async (req, res) => {
//   try {
//     const verification = await verifyUserTokenAndEmail(req);
//       if (!verification.success) {
//         return res.status(200).json(verification);
//       }
//     const { reportedPost, commentId, reason } = req.body;
//     const userId = req.user.userId; // Assuming req.user is populated by a JWT middleware

//     if (!reason || (!reportedPost && !commentId)) {
//       return res.status(400).json({ success: false, message: 'Missing required fields: reason and either postId or commentId' });
//     }

//     const newReport = new Report({
//       reporter: userId,
//       reportedPost: reportedPost,
//       reportedComment: commentId,
//       reason: reason,
//     });

//     await newReport.save();

//     res.status(201).json({ success: true, message: 'Report submitted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getPendingReports = async (req, res) => {
//   try {
//     const verification = await verifyUserTokenAndEmail(req);
//       if (!verification.success) {
//         return res.status(200).json(verification);
//       }
//     const allReports = await Report.find({status: 'pending'})
//       .populate('reporter', 'userName')
//       .populate('reportedPost', 'caption')
//       .populate('reportedComment', 'text');

//     res.status(200).json({ success: true, reports: allReports });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.resolveReport = async (req, res) => {
//   try {
//     // const { id } = req.params;
//     const verification = await verifyUserTokenAndEmail(req);
//       if (!verification.success) {
//         return res.status(200).json(verification);
//       }
//     const { status, takeActionOnContent = false, id } = req.body; // 'dismiss' or 'resolve'

//     const report = await Report.findById(id);
//     if (!report) {
//       return res.status(404).json({ success: false, message: 'Report not found' });
//     }

//     if (status === 'resolved') {
//       report.status = 'resolved';
//       if (takeActionOnContent) {
//         if (report.reportedPost) {
//           await Post.findByIdAndDelete(report.reportedPost);
//         } else if (report.reportedComment) {
//           await Comment.findByIdAndDelete(report.reportedComment);
//         }
//       }
//     } else if (status === 'dismissed') {
//       report.status = 'dismissed';
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid action specified' });
//     }

//     await report.save();
//     res.status(200).json({ success: true, message: 'Report updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

exports.submitReport = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) return res.status(200).json(verification);
    const { reportedAccount, reportedPost, reportedComment, reason } = req.body;
    const userId = req.user.userId;

    if (!reason || (!reportedAccount && !reportedPost && !reportedComment)) {
      return res.status(400).json({ success: false, message: 'Missing required fields: reason and target' });
    }

    const newReport = new Report({ reporter: userId, reportedAccount, reportedPost, reportedComment, reason });
    await newReport.save();
    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.resolveReport = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) return res.status(200).json(verification);

    const { id, status, takeActionOnContent = false } = req.body;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    if (status === 'resolved') {
      report.status = 'resolved';
      if (takeActionOnContent) {
        if (report.reportedAccount) {
          await User.findByIdAndUpdate(report.reportedAccount, { status: 'deleted' }); // Soft-delete
        } else if (report.reportedPost) {
          await Post.findByIdAndUpdate(report.reportedPost, { deleted: true }); // Soft-delete
        } else if (report.reportedComment) {
          await Comment.findByIdAndUpdate(report.reportedComment, { deleted: true }); // Soft-delete
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getReportedAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reports = await Report.find({ reporter: userId, reportedAccount: { $exists: true } })
      .populate('reportedAccount', 'userName avatarUrl status');

    const data = reports.map(report => ({
      accountId: report.reportedAccount?._id,
      userName: report.reportedAccount?.userName,
      avatarUrl: report.reportedAccount?.avatarUrl,
      deleted: report.reportedAccount?.status === 'deleted',
      reportStatus: report.status
    }));

    res.status(200).json({ success: true, accounts: data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getReportedContent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reports = await Report.find({ reporter: userId })
      .populate('reportedPost', 'imageUrl caption deleted')
      .populate('reportedComment', 'imageUrl text deleted');

    const data = [];
    for (const report of reports) {
      if (report.reportedPost) {
        data.push({
          postId: report.reportedPost._id,
          imageUrl: report.reportedPost.imageUrl,
          caption: report.reportedPost.caption,
          deleted: !!report.reportedPost.deleted,
          reportStatus: report.status,
          type: 'post'
        });
      } else if (report.reportedComment) {
        data.push({
          commentId: report.reportedComment._id,
          imageUrl: report.reportedComment.imageUrl,
          text: report.reportedComment.text,
          deleted: !!report.reportedComment.deleted,
          reportStatus: report.status,
          type: 'comment'
        });
      }
    }

    res.status(200).json({ success: true, content: data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
