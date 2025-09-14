const BusinessProfile = require('../models/adModels').BusinessProfile;
const Advertisement = require('../models/adModels').Advertisement;
const AdLocation = require('../models/adModels').AdLocation;
const AdAnalytics = require('../models/adModels').AdAnalytics;
const User = require('../models/User');

// Pricing config (should be in a config file or DB in production)
const adPricing = {
  elite: {
    app_installation: { image: { CPC: 7, CPM: 145, CPV: 0, CPA: 0, CPE: 1.5, CPI: 45 }, video: { CPC: 10, CPM: 180, CPV: 0.75, CPA: 5, CPE: 2.5, CPI: 60 } },
    form: { image: { CPC: 4, CPM: 120, CPV: 0, CPA: 5, CPE: 1, CPI: 0 }, video: { CPC: 8, CPM: 160, CPV: 1, CPA: 9, CPE: 1.5, CPI: 0 } },
    webpage: { image: { CPC: 2, CPM: 95, CPV: 0, CPA: 0, CPE: 0.75, CPI: 0 }, video: { CPC: 5, CPM: 135, CPV: 0.5, CPA: 0, CPE: 1.5, CPI: 0 } }
  },
  // ...add premium and ultimate as per your table
};

// Helper: enforce ad model limits
function checkAdModelLimits(adModel, { ageGroups, interests, locations }) {
  // Helper to count locations
  const countryCount = locations?.countries?.length || 0;
  const stateCount = locations?.countries?.reduce((sum, c) => sum + (c.states?.length || 0), 0);
  const districtCount = locations?.countries?.reduce((sum, c) => sum + (c.states?.reduce((s, st) => s + (st.districts?.length || 0), 0)), 0);

  if (adModel === 'free') {
    if (ageGroups.length !== 1) return 'Free: Only 1 age group allowed';
    if (interests.length > 5) return 'Free: Max 5 interests allowed';
    if (countryCount !== 1) return 'Free: Only 1 country allowed';
    if (stateCount !== 1) return 'Free: Only 1 state allowed';
    if (districtCount !== 1) return 'Free: Only 1 district allowed';
  } else if (adModel === 'premium') {
    if (ageGroups.length !== 1) return 'Premium: Only 1 age group allowed';
    if (interests.length < 6 || interests.length > 25) return 'Premium: Interests 6-25 allowed';
    if (countryCount < 2 || countryCount > 20) return 'Premium: 2-20 countries allowed';
    if (locations.countries?.some(c => (c.states?.length || 0) > 5)) return 'Premium: Up to 5 states per country';
    if (locations.countries?.some(c => c.states?.some(st => (st.districts?.length || 0) > 4))) return 'Premium: Up to 4 districts per state';
  } else if (adModel === 'elite') {
    if (ageGroups.length > 2) return 'Elite: Max 2 age groups';
    if (interests.length < 26 || interests.length > 60) return 'Elite: Interests 26-60';
    if (countryCount < 21 || countryCount > 50) return 'Elite: 21-50 countries allowed';
    if (locations.countries?.some(c => (c.states?.length || 0) > 12)) return 'Elite: Up to 12 states per country';
    if (locations.countries?.some(c => c.states?.some(st => (st.districts?.length || 0) > 8))) return 'Elite: Up to 8 districts per state';
  } else if (adModel === 'ultimate') {
    if (ageGroups.length < 1) return 'Ultimate: At least 1 age group';
    if (interests.length < 31) return 'Ultimate: At least 31 interests';
    if (countryCount < 50) return 'Ultimate: At least 50 countries';
    if (locations.countries?.some(c => (c.states?.length || 0) > 15)) return 'Ultimate: Up to 15 states per country';
    // Unlimited districts per state
  }
  return null;
}

// Business and Ad creation
exports.createBusinessAndAd = async (req, res) => {
  try {
    // 1. Create Business Profile
    const business = await BusinessProfile.create({
      user: req.user._id,
      ...req.body,
      businessCertificates: req.files?.certificates?.map(f => f.path) || []
    });
    // 2. Create Location
    const locations = await AdLocation.create(req.body.locations);
    // 3. Enforce ad model limits
    const limitError = checkAdModelLimits(req.body.adModel, {
      ageGroups: req.body.targetedAgeGroup,
      interests: req.body.interests,
      locations: req.body.locations
    });
    if (limitError) return res.status(400).json({ success: false, message: limitError });
    // 4. Create Advertisement
    const ad = await Advertisement.create({
      business: business._id,
      typeOfAdContent: req.body.typeOfAdContent,
      adContentUrl: req.body.adContentUrl,
      adElements: req.body.adElements,
      appStoreLink: req.body.appStoreLink,
      playStoreLink: req.body.playStoreLink,
      adModel: req.body.adModel,
      targetedAgeGroup: req.body.targetedAgeGroup,
      interests: req.body.interests,
      locations: locations._id
    });
    res.status(201).json({ success: true, business, ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Advertiser (business) account creation
exports.createAdvertiserAccount = async (req, res) => {
  if (!(await verifyAuth(req))) return res.status(401).json({ success: false, message: 'Unauthorized: email and token required' });
  try {
    const business = await BusinessProfile.create({
      user: req.user?._id,
      ...req.body,
      businessCertificates: req.files?.certificates?.map(f => f.path) || []
    });
    res.status(201).json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ad creation (requires advertiserId)
exports.createAd = async (req, res) => {
  if (!(await verifyAuth(req))) return res.status(401).json({ success: false, message: 'Unauthorized: email and token required' });
  try {
    const { advertiserId } = req.body;
    if (!advertiserId) return res.status(400).json({ success: false, message: 'advertiserId is required' });
    const business = await BusinessProfile.findById(advertiserId);
    if (!business) return res.status(404).json({ success: false, message: 'Advertiser not found' });
    // Create Location
    const locations = await AdLocation.create(req.body.locations);
    // Enforce ad model limits
    const limitError = checkAdModelLimits(req.body.adModel, {
      ageGroups: req.body.targetedAgeGroup,
      interests: req.body.interests,
      locations: req.body.locations
    });
    if (limitError) return res.status(400).json({ success: false, message: limitError });
    // Create Advertisement
    const ad = await Advertisement.create({
      business: business._id,
      typeOfAdContent: req.body.typeOfAdContent,
      adContentUrl: req.body.adContentUrl,
      adElements: req.body.adElements,
      appStoreLink: req.body.appStoreLink,
      playStoreLink: req.body.playStoreLink,
      adModel: req.body.adModel,
      targetedAgeGroup: req.body.targetedAgeGroup,
      interests: req.body.interests,
      locations: locations._id
    });
    res.status(201).json({ success: true, ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ad event tracking and billing
exports.trackAdEvent = async (req, res) => {
  try {
    const { adId, actions } = req.body; // actions: { impression, click, view, engagement, install, formSubmit }
    const ad = await Advertisement.findById(adId);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    // Update analytics
    Object.keys(actions).forEach(key => {
      ad.analytics[key] += actions[key] || 0;
    });
    // Calculate cost
    const rates = adPricing[ad.adModel][ad.adElements][ad.typeOfAdContent];
    let total = 0;
    if (actions.impression) total += (rates.CPM / 1000) * actions.impression;
    if (actions.click) total += rates.CPC * actions.click;
    if (actions.view) total += (rates.CPV || 0) * actions.view;
    if (actions.engagement) total += rates.CPE * actions.engagement;
    if (actions.install) total += (rates.CPI || 0) * actions.install;
    if (actions.formSubmit) total += (rates.CPA || 0) * actions.formSubmit;
    // Deduct from wallet
    let walletBefore = ad.wallet;
    if (ad.wallet > 0) {
      if (ad.wallet >= total) {
        ad.wallet -= total;
      } else {
        ad.billing.overage += (total - ad.wallet);
        ad.wallet = 0;
      }
    } else {
      ad.billing.overage += total;
    }
    ad.billing.totalSpent += total;
    // Pause ad if wallet exhausted and not topped up
    if (ad.wallet <= 0 && ad.adModel === 'free') ad.isActive = false;
    await ad.save();
    res.json({ success: true, walletBefore, walletAfter: ad.wallet, cost: total, overage: ad.billing.overage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Analytics endpoint
exports.getAdAnalytics = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.adId);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    res.json({ success: true, analytics: ad.analytics, billing: ad.billing, wallet: ad.wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Metrics endpoint
exports.getAdMetrics = async (req, res) => {
  try {
    const adId = req.params.adId;
    const ad = await Advertisement.findById(adId).populate('business');
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    const analytics = ad.analytics;
    const rates = adPricing[ad.adModel][ad.adElements][ad.typeOfAdContent];
    // Metrics calculation
    const metrics = {
      CPM: { count: analytics.impressions, amount: Math.round((rates.CPM / 1000) * analytics.impressions) },
      CPC: { count: analytics.clicks, amount: analytics.clicks * rates.CPC },
      CPI: { count: analytics.installs, amount: analytics.installs * (rates.CPI || 0) },
      CPE: { count: analytics.engagements, amount: analytics.engagements * rates.CPE },
      CPV: { count: analytics.views, amount: analytics.views * (rates.CPV || 0) },
      CPA: { count: analytics.formSubmits, amount: analytics.formSubmits * (rates.CPA || 0) }
    };
    const totalBill = Object.values(metrics).reduce((sum, m) => sum + m.amount, 0);
    // Engagement breakdown
    const engagementEvents = await AdAnalytics.find({ ad: adId, eventType: 'engagement' }).sort({ timestamp: -1 }).lean();
    const userIds = engagementEvents.map(e => e.user);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    // Aggregate reactions
    const reactionCounts = {};
    engagementEvents.forEach(e => {
      const reaction = e.reaction || 'other';
      reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
    });
    // Prepare user list with reaction
    const engagementUsers = engagementEvents.slice(0, 10).map(e => {
      const u = users.find(user => String(user._id) === String(e.user));
      return {
        name: u?.fullName || u?.userName || 'Account Name',
        age: u?.age,
        gender: u?.gender,
        city: u?.city,
        date: e.timestamp,
        reaction: e.reaction || '',
        profilePic: u?.profilePic || ''
      };
    });
    res.json({
      ad: {
        name: ad.business?.businessName || 'App_name',
        createdAt: ad.createdAt,
        about: ad.business?.aboutBusiness || '',
        adContent: ad.adContentUrl,
        adContentType: ad.typeOfAdContent,
        adElement: ad.adElements,
        adModel: ad.adModel,
        userBase: ad.userBase || 0
      },
      metrics,
      totalBill,
      engagement: {
        total: metrics.CPE.count,
        reactions: reactionCounts,
        users: engagementUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};