
const qrcode = require('qrcode');

class QR {
    static async generateInstagramQR(userId) {
        if (!userId) {
            throw new Error('userId is required');
        }
        const instagramProfileUrl = `https://www.website.com/${userId}/`;
        try {
            const qrCodeDataUrl = await qrcode.toDataURL(instagramProfileUrl);
            return qrCodeDataUrl;
        } catch (err) {
            console.error('QR code generation error:', err);
            throw new Error('Failed to generate QR code');
        }
    }
}

module.exports = QR;