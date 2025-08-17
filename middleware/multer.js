const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       return cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()} + "-" ` + file.originalname);
    },
});

exports.uploadd = multer({ storage });
