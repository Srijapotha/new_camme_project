// BusinessProfile model
const mongoose = require('mongoose');

const businessProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessTheme: String,
  businessProfile: String, // image URL
  businessName: String,
  industrialSector: String,
  aboutBusiness: String,
  businessCertificates: [String], // up to 3 file URLs
  businessMobileNumber: String,
  businessEmail: String,
  businessLocation: String,
  businessWebsite: String,
}, { timestamps: true });

// AdLocation model
const citySchema = new mongoose.Schema({ name: String, count: { type: Number, default: 0 } });
const districtSchema = new mongoose.Schema({ name: String, cities: [citySchema], count: { type: Number, default: 0 } });
const stateSchema = new mongoose.Schema({ name: String, districts: [districtSchema], count: { type: Number, default: 0 } });
const countrySchema = new mongoose.Schema({ name: String, states: [stateSchema], count: { type: Number, default: 0 } });
const adLocationSchema = new mongoose.Schema({ countries: [countrySchema] });

// Advertisement model
const advertisementSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  typeOfAdContent: { type: String, enum: ['image', 'video'], required: true },
  adContentUrl: String,
  adElements: { type: String, enum: ['app_installation', 'form', 'webpage'], required: true },
  appStoreLink: String,
  playStoreLink: String,
  adModel: { type: String, enum: ['free', 'premium', 'elite', 'ultimate'], required: true },
  targetedAgeGroup: [String],
  interests: [String],
  locations: { type: mongoose.Schema.Types.ObjectId, ref: 'AdLocation' },
  formFields: [String], // Added for form ads
  wallet: { type: Number, default: 2500 }, // initial free credit
  isActive: { type: Boolean, default: true },
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    engagements: { type: Number, default: 0 },
    installs: { type: Number, default: 0 },
    formSubmits: { type: Number, default: 0 }
  },
  billing: {
    totalSpent: { type: Number, default: 0 },
    overage: { type: Number, default: 0 }
  }
}, { timestamps: true });

// AdAnalytics model (optional, for per-event logging)
const adAnalyticsSchema = new mongoose.Schema({
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement', required: true },
  eventType: { type: String, enum: ['impression', 'click', 'view', 'engagement', 'install', 'formSubmit'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);
const AdLocation = mongoose.model('AdLocation', adLocationSchema);
const Advertisement = mongoose.model('Advertisement', advertisementSchema);
const AdAnalytics = mongoose.model('AdAnalytics', adAnalyticsSchema);

module.exports = {
  BusinessProfile,
  AdLocation,
  Advertisement,
  AdAnalytics
};