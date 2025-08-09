const mongoose = require("mongoose");

const connectionFilterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    intrestedFiled: [{
        type: String,
        required: true,
    }],
    hashTag: [{
        type: String,
        required: true,
    }],
    location: {
        lattitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
    contacts: [{
        displayName: {
            type: String,
            required: false, // Optional
        },
        phones: [{
            type: String,
            required: false, // Optional
        }],
        emails: [{
            type: String,
            required: false, // Optional
        }]
    }],
    is_AllowContacts: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("ConnectionFilter", connectionFilterSchema);


