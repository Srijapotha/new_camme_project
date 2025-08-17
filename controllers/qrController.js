const { verifyUserTokenAndEmail } = require("../middleware/addirionalSecurity");
const QR = require("../models/QR");

exports.getInstagramQrCode = async (req, res) => {
  const { userId } = req.body;
  const verification = await verifyUserTokenAndEmail(req);
  if (!verification.success) {
    return res.status(200).json(verification);
  }

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide an CamMe userId." });
  }

  try {
    const qrCodeDataUrl = await QR.generateInstagramQR(userId);
    res.status(200).json({ success: true, qrCode: qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
