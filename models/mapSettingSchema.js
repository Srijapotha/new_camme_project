const { type } = require("express/lib/response");
const mongoose = require("mongoose");


const mapSettingSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    profileDisplay:{
        type:Boolean,
        default:false,
    },
    apporachMode:{
        type:Boolean,
        default:false,
    },
})


module.exports = mongoose.model("mapSetting",mapSettingSchema)