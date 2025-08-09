const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
exports.dbConnect = async () =>{
    
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error: ", err);
    });
}