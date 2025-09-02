const NotificationSettings = require('../models/notificationSettingsModel');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

// Get user's notification settings
exports.getNotificationSettings = async (req, res) => {
    try {
        // Verification step
        const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) return res.status(200).json(verification);

        const userId = req.user.userId;
        
        let settings = await NotificationSettings.findOne({ userId });
        
        // If no settings exist, create default settings
        if (!settings) {
            settings = new NotificationSettings({ userId });
            await settings.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Notification settings retrieved successfully',
            settings
        });
    } catch (error) {
        console.error('Error in getNotificationSettings:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving notification settings'
        });
    }
};

// Update user's notification settings
exports.updateNotificationSettings = async (req, res) => {
    try {
        // Verification step
        const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) return res.status(200).json(verification);

        const userId = req.user.userId;
        const {
            notifications,
            posts,
            photographs,
            filterApplies,
            moments,
            coinInteractions,
            opinions,
            shares,
            saved,
            chats,
            lives,
            requests
        } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (typeof notifications === 'boolean') updateData.notifications = notifications;
        if (typeof posts === 'boolean') updateData.posts = posts;
        if (typeof photographs === 'boolean') updateData.photographs = photographs;
        if (typeof filterApplies === 'boolean') updateData.filterApplies = filterApplies;
        if (typeof moments === 'boolean') updateData.moments = moments;
        if (typeof coinInteractions === 'boolean') updateData.coinInteractions = coinInteractions;
        if (typeof opinions === 'boolean') updateData.opinions = opinions;
        if (typeof shares === 'boolean') updateData.shares = shares;
        if (typeof saved === 'boolean') updateData.saved = saved;
        if (typeof chats === 'boolean') updateData.chats = chats;
        if (typeof lives === 'boolean') updateData.lives = lives;
        if (typeof requests === 'boolean') updateData.requests = requests;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid notification settings provided'
            });
        }

        const settings = await NotificationSettings.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Notification settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error in updateNotificationSettings:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating notification settings'
        });
    }
};

// Reset notification settings to default
exports.resetNotificationSettings = async (req, res) => {
    try {
        // Verification step
        const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) return res.status(200).json(verification);

        const userId = req.user.userId;

        const defaultSettings = {
            notifications: true,
            posts: true,
            photographs: true,
            filterApplies: true,
            moments: true,
            coinInteractions: true,
            opinions: true,
            shares: true,
            saved: true,
            chats: true,
            lives: true,
            requests: true
        };

        const settings = await NotificationSettings.findOneAndUpdate(
            { userId },
            defaultSettings,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Notification settings reset to default successfully',
            settings
        });
    } catch (error) {
        console.error('Error in resetNotificationSettings:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while resetting notification settings'
        });
    }
};

// Update a specific notification setting
exports.updateSpecificSetting = async (req, res) => {
    try {
        // Verification step
        const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) return res.status(200).json(verification);

        const userId = req.user.userId;
        const { settingType, value } = req.body;

        const validSettings = [
            'notifications', 'posts', 'photographs', 'filterApplies', 
            'moments', 'coinInteractions', 'opinions', 'shares', 
            'saved', 'chats', 'lives', 'requests'
        ];

        if (!validSettings.includes(settingType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid setting type'
            });
        }

        if (typeof value !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Setting value must be a boolean'
            });
        }

        const updateData = { [settingType]: value };
        
        const settings = await NotificationSettings.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: `${settingType} setting updated successfully`,
            settings
        });
    } catch (error) {
        console.error('Error in updateSpecificSetting:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating specific notification setting'
        });
    }
};