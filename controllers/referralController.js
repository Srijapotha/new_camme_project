const User = require('../models/userModel');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');



exports.getReferralStats = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) {
          return res.status(200).json(verification);
        }
    const user = await User.findById(req.user.userId)
      .select('referralId scorePoints coins');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const referredCount = await User.countDocuments({ referredBy: user.referralId });
    res.json({ 
      referralId: user.referralId,
      referralLink: `https://yourapp.com/register?ref=${user.referralId}`,
      scorePoints: user.scorePoints,
      coins: user.coins,
      totalReferred: referredCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New functionality: Get app download URL with referral code
exports.getAppDownloadReferralLink = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) {
          return res.status(200).json(verification);
        }
    const { userId } = req.user.userId;
    const user = await User.findById(userId).select('referralId');
    if (!user || !user.referralId) {
      return res.status(404).json({ error: 'User or referral code not found' });
    }
    // Replace with your actual app download link
    const downloadUrl = `https://yourapp.com/download?ref=${user.referralId}`;
    res.json({
      success: true,
      downloadUrl,
      message: 'Share this link to invite users to download the app with your referral code.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};