const bcrypt = require('bcryptjs');

// Notification setting utility
exports.setNotificationSetting = async (UserModel, userId, targetId, enabled) => {
  await UserModel.findByIdAndUpdate(userId, {
    [`notificationSettings.${targetId}`]: enabled
  });
};

exports.getNotificationSetting = async (UserModel, userId, targetId) => {
  const user = await UserModel.findById(userId);
  return !!user.notificationSettings?.get(targetId);
};

// PIN management utility
exports.setPin = async (UserModel, userId, pinField, targetId, pin, oldPin) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');
  if (oldPin) {
    const storedPin = user[pinField]?.get(targetId);
    if (!storedPin || !(await bcrypt.compare(oldPin, storedPin))) {
      throw new Error('Old PIN incorrect');
    }
  }
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be 4 digits');
  }
  const hashedPin = await bcrypt.hash(pin, 10);
  await UserModel.findByIdAndUpdate(userId, {
    [`${pinField}.${targetId}`]: hashedPin
  });
};

exports.verifyPin = async (UserModel, userId, pinField, targetId, pin) => {
  const user = await UserModel.findById(userId);
  const storedPin = user[pinField]?.get(targetId);
  if (!storedPin) throw new Error('No PIN set');
  return await bcrypt.compare(pin, storedPin);
};

// ...add more shared utilities as needed...
