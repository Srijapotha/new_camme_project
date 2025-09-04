const DevicePermission = require('../models/devicePermissionModel');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

// Allowed fields clients can set
const ALLOWED_FIELDS = ['gallery', 'location', 'microphone', 'camera', 'notifications', 'mobileContacts'];

exports.upsertPermissions = async (req, res) => {
    try {
        const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) {
            return res.status(200).json(verification);
        }
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const payload = {};
        ALLOWED_FIELDS.forEach(f => {
            if (typeof req.body[f] !== 'undefined') payload[f] = !!req.body[f];
        });
        payload.updatedAt = new Date();

        const doc = await DevicePermission.findOneAndUpdate(
            { userId },
            { $set: payload },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({ success: true, devicePermissions: doc });
    } catch (err) {
        console.error('upsertPermissions error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getPermissions = async (req, res) => {
    try {
        const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) {
            return res.status(200).json(verification);
        }
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const doc = await DevicePermission.findOne({ userId });
        return res.status(200).json({ success: true, devicePermissions: doc || null });
    } catch (err) {
        console.error('getPermissions error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updatePermission = async (req, res) => {
    try {
        const verification = await verifyUserTokenAndEmail(req);
        if (!verification.success) {
            return res.status(200).json(verification);
        }
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { field, value } = req.body;
        if (!field || !ALLOWED_FIELDS.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing field' });
        }

        const update = { [field]: !!value, updatedAt: new Date() };
        const doc = await DevicePermission.findOneAndUpdate({ userId }, { $set: update }, { new: true });

        if (!doc) {
            // create new doc if not existed
            const created = await DevicePermission.create(Object.assign({ userId }, update));
            return res.status(200).json({ success: true, devicePermissions: created });
        }

        return res.status(200).json({ success: true, devicePermissions: doc });
    } catch (err) {
        console.error('updatePermission error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
