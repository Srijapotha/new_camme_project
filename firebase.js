const dotenv = require("dotenv");
dotenv.config()
const admin = require("firebase-admin");
const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
//const serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
const serviceAccount = require("./camme-9a681-firebase-adminsdk-fbsvc-144e042b2c.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;

