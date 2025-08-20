const User = require('../models/userModel');

function generateReferralId() {
  return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

exports.registerUser = async (req, res) => {
  try {
    const { username, email, referredBy } = req.body;
    let referralId;
    do {
      referralId = generateReferralId();
    } while (await User.findOne({ referralId }));
    const user = new User({
      username,
      email,
      referralId
    });
    await user.save();
    if (referredBy) {
      const referrer = await User.findOne({ referralId: referredBy });
      if (referrer) {
        await User.findByIdAndUpdate(referrer._id, {
          $inc: {
            scorePoints: 250,
            'coins.tedGold': 50,
            'coins.tedSilver': 35,
            'coins.tedBrown': 15
          }
        });
      }
    }
    res.json({ 
      user, 
      referralLink: `https://yourapp.com/register?ref=${referralId}`,
      message: 'User registered successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
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