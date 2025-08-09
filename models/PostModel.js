const { contentType, type } = require("express/lib/response");
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        image: {
            type: Boolean,
            default: false,
        },
        imageUrl: {
            type: [String],
            required: function () {
                return this.content?.image === true;
            },
        },
        description: {
            type: Boolean,
            default: true,
        },
        descriptionText: {
            type: String,
            required: function () {
                return this.content?.description === true;
            },
        },
    },
    visibility: {
        type: Boolean,
        enum: [true, false],
        default: true, // false = private, true = public
    },
    is_photography: {
        type: Boolean,
        enum: [true, false],
        default: false, // false = text, true = image
    },
    hashTag: {
        type: [String],
        required: false,
    },
    filteredImageUrl: {
        type: String,
        required: false
    },
    appliedFilter: {
        type: String,
        default: 'normal'
    }
    ,
    colorMatrix: {
        type: [mongoose.Schema.Types.Decimal128],
        required: false,
        default: [],
    },

    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            comment: {
                type: String,
                required: true,
            },
            replies: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    reply: {
                        type: String,
                        required: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        },
    ],
    expressions: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        },
    ],
    tedGoldGivers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    tedGoldCount: {
        type: Number,
        default: 0
    },
    tedSilverGivers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    tedSilverCount: {
        type: Number,
        default: 0
    },
    tedBronzeGivers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    tedBronzeCount: {
        type: Number,
        default: 0
    },
    tedBlackGivers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    tedBlackCount: {
        type: Number,
        default: 0
    },
    tedBlackCoinData: {
        givenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        reason: {
            type: String,
            required: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        voters: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        agree: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        disagree: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        isFinalized: {
            type: Boolean,
            default: false
        },
        hashTags: {
            type: String,
            enum: ["spam", "abuse", "misinformation"],
            default:"spam",
        }
    },
    shareCount: {
        type: Number,
        default: 0,
    },
    shares: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model("Postcreate", postSchema);
