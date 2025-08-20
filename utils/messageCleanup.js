const cron = require('node-cron');
const Message = require('../models/message');

// Run every hour to clean up expired messages
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const expiredMessages = await Message.find({
      autoDeleteAt: { $lte: now }
    });

    if (expiredMessages.length > 0) {
      await Message.deleteMany({
        autoDeleteAt: { $lte: now }
      });
      console.log(`Deleted ${expiredMessages.length} expired messages`);
    }
  } catch (error) {
    console.error('Error cleaning up messages:', error);
  }
});