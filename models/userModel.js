const e = require('express');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    dateBirth: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phoneNo: {
        type: String,
        required: true,
        match: [/^(\+91)?\d{10}$/, 'Phone number must be 10 digits with optional +91']
    },
    password: {
        type: String,
        // required: true,
        minlength: [6, 'Password must be at least 6 characters']
    },
    // confirmPassword: {
    //     type: String,
    //     // required: true,
    //     minlength: [6, 'Password must be at least 6 characters']
    // },
    profilePic: {
        type: String,
        required: true
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
        default: Date.now,
    },
    theme: {
        type: String, 
        // required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    linkRequests: [{
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        otp: String,
        otpExpires: Date
    }],
    userAllFriends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Postcreate"
    }],

    coinWallet: {
        tedGold: {
            type: Number,
            default: 1
        },
        tedSilver: {
            type: Number,
            default: 1
        },
        tedBronze: {
            type: Number,
            default: 1
        },
        tedBlack: {
            type: Number,
            default: 1
        },
        totalTedCoin: {
            type: Number,
            default: 0,
        },
    },
    resetTokenExpiry: Date,
    receivedShares: [
        {
            from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            post: { type: mongoose.Schema.Types.ObjectId, ref: "Postcreate" },
            sharedAt: { type: Date, default: Date.now }
        }
    ],
    fcmToken: { type: String }, // store token from Flutter app
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    points: {
        type: Number,
        default: 0,
    },
    freeCredit: {
        type: Number,
        default: 0,
    },
    loginStartTime: {
        type: Date,
        default: null,
    },
    totalSessionTime: {
        type: Number,
        default: 0,
    }, // in seconds
    hasExceededLimit: {
        type: Boolean,
        default: false,
    },
    
    savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Postcreate'
    }
  ],
  savedItems: [
  {
    type: {
      type: String,
      enum: ['post', 'photograph', 'filter'],
      required: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    //   refPath: 'savedItems.type'  // This makes it dynamic based on the type
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }
],
  referralId: { type: String, unique: true },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  restrictedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privateChatPins: { type: Map, of: String }, // chatId -> PIN hash
  savedMessages: [{
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    savedAt: { type: Date, default: Date.now }
  }],
  notificationSettings: { type: Map, of: Boolean }, // userId -> enabled
  socialMedia: [
    {
      platform: { type: String, required: true }, // e.g., 'x', 'instagram', etc.
      linked: { type: Boolean, default: false },
      followers: { type: Number, default: 0 },
      url: { type: String },
      verifiedEmail: { type: Boolean, default: false },
      verifiedPhone: { type: Boolean, default: false },
      lastChecked: { type: Date },
      tier: { type: String }
    }
  ],
  profileVisitors: [
    {
      visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      visitedAt: { type: Date, default: Date.now }
    }
  ],
  // Add new fields for privacy settings
  autoDeleteChat: {
    type: String,
    enum: ['24h', '1w', '30d', 'never'],
    default: 'never'
  },
  hideMutualFriends: {
    type: Boolean,
    default: false
  }
},)

// { strict: false }
module.exports = mongoose.model('User', userSchema);