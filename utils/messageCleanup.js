// const cron = require('node-cron');
// const Message = require('../models/message');

// // Run every hour to clean up expired messages
// cron.schedule('0 * * * *', async () => {
//   try {
//     const now = new Date();
//     const expiredMessages = await Message.find({
//       autoDeleteAt: { $lte: now }
//     });

//     if (expiredMessages.length > 0) {
//       await Message.deleteMany({
//         autoDeleteAt: { $lte: now }
//       });
//       console.log(`Deleted ${expiredMessages.length} expired messages`);
//     }
//   } catch (error) {
//     console.error('Error cleaning up messages:', error);
//   }
// });

const cron = require('node-cron');
const Message = require('../models/message');
const User = require('../models/userModel');

// Helper to convert autoDeleteChat value to milliseconds
function getAutoDeleteMs(setting) {
  switch (setting) {
    case '24h': return 24 * 60 * 60 * 1000;
    case '1w': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    default: return null; // 'never'
  }
}

// Run every hour to clean up expired messages (per-message autoDeleteAt)
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const expiredMessages = await Message.find({
      autoDeleteAt: { $lte: now, $ne: null }
    });

    if (expiredMessages.length > 0) {
      await Message.deleteMany({
        autoDeleteAt: { $lte: now, $ne: null }
      });
      console.log(`Deleted ${expiredMessages.length} expired messages (per-message autoDeleteAt)`);
    }

    // --- User-based autoDeleteChat cleanup ---
    const users = await User.find({ autoDeleteChat: { $ne: 'never' } });
    const nowMs = Date.now();

    for (const user of users) {
      const ms = getAutoDeleteMs(user.autoDeleteChat);
      if (!ms) continue;

      const result = await Message.deleteMany({
        senderId: user._id,
        sentAt: { $lte: new Date(nowMs - ms) }
      });

      if (result.deletedCount > 0) {
        console.log(`User ${user._id}: Deleted ${result.deletedCount} messages older than ${user.autoDeleteChat}`);
      }
    }
    // --- End user-based cleanup ---

  } catch (error) {
    console.error('Error cleaning up messages:', error);
  }
});