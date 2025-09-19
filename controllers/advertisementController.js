const BusinessProfile = require('../models/adModels').BusinessProfile;
const Advertisement = require('../models/adModels').Advertisement;
const AdLocation = require('../models/adModels').AdLocation;
const AdAnalytics = require('../models/adModels').AdAnalytics;
const User = require('../models/userModel');
const AdFormSubmission = require('../models/AdFormSubmission');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

// Pricing config (should be in a config file or DB in production)
const adPricing = {
  free: {
    form: { image: { CPC: 5, CPM: 145, CPV: 0, CPA: 8, CPE: 1.5, CPI: 50 }, video: { CPC: 5, CPM: 145, CPV: 0.75, CPA: 8, CPE: 1.5, CPI: 50 } },
    app_installation: { image: { CPC: 5, CPM: 145, CPV: 0, CPA: 0, CPE: 1.5, CPI: 50 }, video: { CPC: 5, CPM: 145, CPV: 0.75, CPA: 0, CPE: 1.5, CPI: 50 } },
    webpage: { image: { CPC: 5, CPM: 145, CPV: 0, CPA: 0, CPE: 1.5, CPI: 0 }, video: { CPC: 5, CPM: 145, CPV: 0.75, CPA: 0, CPE: 1.5, CPI: 0 } }
  },
  premium: {
    form: { image: { CPC: 6, CPM: 150, CPV: 0, CPA: 10, CPE: 2, CPI: 60 }, video: { CPC: 8, CPM: 160, CPV: 1, CPA: 12, CPE: 2.5, CPI: 70 } },
    app_installation: { image: { CPC: 6, CPM: 150, CPV: 0, CPA: 0, CPE: 2, CPI: 60 }, video: { CPC: 8, CPM: 160, CPV: 1, CPA: 0, CPE: 2.5, CPI: 70 } },
    webpage: { image: { CPC: 6, CPM: 150, CPV: 0, CPA: 0, CPE: 2, CPI: 0 }, video: { CPC: 8, CPM: 160, CPV: 1, CPA: 0, CPE: 2.5, CPI: 0 } }
  },
  elite: {
    form: { image: { CPC: 4, CPM: 120, CPV: 0, CPA: 5, CPE: 1, CPI: 0 }, video: { CPC: 8, CPM: 160, CPV: 1, CPA: 9, CPE: 1.5, CPI: 0 } },
    app_installation: { image: { CPC: 7, CPM: 145, CPV: 0, CPA: 0, CPE: 1.5, CPI: 45 }, video: { CPC: 10, CPM: 180, CPV: 0.75, CPA: 5, CPE: 2.5, CPI: 60 } },
    webpage: { image: { CPC: 2, CPM: 95, CPV: 0, CPA: 0, CPE: 0.75, CPI: 0 }, video: { CPC: 5, CPM: 135, CPV: 0.5, CPA: 0, CPE: 1.5, CPI: 0 } }
  },
  ultimate: {
    form: { image: { CPC: 10, CPM: 200, CPV: 0, CPA: 15, CPE: 3, CPI: 100 }, video: { CPC: 12, CPM: 220, CPV: 2, CPA: 18, CPE: 3.5, CPI: 120 } },
    app_installation: { image: { CPC: 10, CPM: 200, CPV: 0, CPA: 0, CPE: 3, CPI: 100 }, video: { CPC: 12, CPM: 220, CPV: 2, CPA: 0, CPE: 3.5, CPI: 120 } },
    webpage: { image: { CPC: 10, CPM: 200, CPV: 0, CPA: 0, CPE: 3, CPI: 0 }, video: { CPC: 12, CPM: 220, CPV: 2, CPA: 0, CPE: 3.5, CPI: 0 } }
  }
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

// Business profile creation (for /ads/business/create)
exports.createBusinessAndAd = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const business = await BusinessProfile.create({
      user: req.user.userId,
      businessTheme: req.body.businessTheme,
      businessProfile: req.body.businessProfile,
      businessName: req.body.businessName,
      industrialSector: req.body.industrialSector,
      aboutBusiness: req.body.aboutBusiness,
      businessCertificates: req.files?.certificates?.map(f => f.path) || [],
      businessMobileNumber: req.body.businessMobileNumber,
      businessEmail: req.body.businessEmail,
      businessLocation: req.body.businessLocation,
      businessWebsite: req.body.businessWebsite
    });
    res.status(201).json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Advertiser (business) account creation
exports.createAdvertiserAccount = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const business = await BusinessProfile.create({
      user: req.user.userId,
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
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { advertiserId, typeOfAdContent, adElements, adContentUrl, adDescription, websiteLink, formFields, appStoreLink, playStoreLink, targetedAgeGroup, interests, locations, adModel, status } = req.body;
    if (!advertiserId) return res.status(400).json({ success: false, message: 'advertiserId is required' });
    if (!typeOfAdContent || !['image', 'video'].includes(typeOfAdContent)) return res.status(400).json({ success: false, message: 'Invalid ad content type' });
    if (!adElements || !['app_installation', 'webpage', 'form'].includes(adElements)) return res.status(400).json({ success: false, message: 'Invalid ad element' });
    if (!adDescription || adDescription.length > 500) return res.status(400).json({ success: false, message: 'Description required, max 500 chars' });
    // Validate content
    if (typeOfAdContent === 'image' && !adContentUrl) return res.status(400).json({ success: false, message: 'Image content required' });
    if (typeOfAdContent === 'video') {
      if (!adContentUrl) return res.status(400).json({ success: false, message: 'Video content required' });
      // Optionally: check video duration (should be 30s)
      // This requires video metadata extraction, which is best done on upload
    }
    // Validate ad element specific fields
    let adData = {};
    if (adElements === 'webpage') {
      if (!websiteLink || !validator.isURL(websiteLink)) return res.status(400).json({ success: false, message: 'Valid website link required' });
      adData.websiteLink = websiteLink;
    }
    if (adElements === 'form') {
      if (!Array.isArray(formFields) || formFields.length === 0) return res.status(400).json({ success: false, message: 'At least one form field required' });
      adData.formFields = formFields;
    }
    if (adElements === 'app_installation') {
      if (!appStoreLink || !validator.isURL(appStoreLink)) return res.status(400).json({ success: false, message: 'Valid App Store link required' });
      if (!playStoreLink || !validator.isURL(playStoreLink)) return res.status(400).json({ success: false, message: 'Valid Play Store link required' });
      adData.appStoreLink = appStoreLink;
      adData.playStoreLink = playStoreLink;
    }
    // Create Location
    const adLocation = await AdLocation.create(locations);
    // Enforce ad model limits
    const limitError = checkAdModelLimits(adModel, {
      ageGroups: targetedAgeGroup,
      interests,
      locations
    });
    if (limitError) return res.status(400).json({ success: false, message: limitError });
    // Generate unique URL
    const uniqueUrl = `/ad/${uuidv4()}`;

    // Set initial wallet for Free model
    let walletInit = undefined;
    if (adModel === 'free') walletInit = 2500;

    // Create Advertisement
    const ad = await Advertisement.create({
      business: advertiserId,
      typeOfAdContent,
      adContentUrl,
      adDescription,
      adElements,
      ...adData,
      targetedAgeGroup,
      interests,
      locations: adLocation._id,
      adModel,
      status: status || 'draft',
      uniqueUrl,
      ...(walletInit !== undefined ? { wallet: walletInit } : {})
    });
    res.status(201).json({ success: true, ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ad event tracking and billing
exports.trackAdEvent = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId, actions, userId } = req.body;
    const ad = await Advertisement.findById(adId);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    // Update analytics
    Object.keys(actions).forEach(key => {
      ad.analytics[key] += actions[key] || 0;
    });
    // Insert AdAnalytics events for each action
    const eventMap = {
      impressions: 'impression',
      clicks: 'click',
      views: 'view',
      engagements: 'engagement',
      installs: 'install',
      formSubmits: 'formSubmit',
      // impression: 'impression',
      // click: 'click',
      // view: 'view',
      // engagement: 'engagement',
      // install: 'install',
      // formSubmit: 'formSubmit'
    };
    for (const key in actions) {
      if (actions[key] > 0 && eventMap[key]) {
        for (let i = 0; i < actions[key]; i++) {
          await AdAnalytics.create({
            ad: adId,
            eventType: eventMap[key],
            user: userId || null,
            timestamp: new Date()
          });
        }
      }
    }
    // Calculate cost
    const rates = adPricing[ad.adModel][ad.adElements][ad.typeOfAdContent];
    let total = 0;
    if (actions.impressions) total += (rates.CPM / 1000) * actions.impressions;
    if (actions.clicks) total += rates.CPC * actions.clicks;
    if (actions.views) total += (rates.CPV || 0) * actions.views;
    if (actions.engagements) total += rates.CPE * actions.engagements;
    if (actions.installs) total += (rates.CPI || 0) * actions.installs;
    if (actions.formSubmits) total += (rates.CPA || 0) * actions.formSubmits;
    // if (actions.impression) total += (rates.CPM / 1000) * actions.impression;
    // if (actions.click) total += rates.CPC * actions.click;
    // if (actions.view) total += (rates.CPV || 0) * actions.view;
    // if (actions.engagement) total += rates.CPE * actions.engagement;
    // if (actions.install) total += (rates.CPI || 0) * actions.install;
    // if (actions.formSubmit) total += (rates.CPA || 0) * actions.formSubmit;
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
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId } = req.body;
    const ad = await Advertisement.findById(adId);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    res.json({ success: true, analytics: ad.analytics, billing: ad.billing, wallet: ad.wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Metrics endpoint
exports.getAdMetrics = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId } = req.body;
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

// User submits form data for an ad
exports.submitAdForm = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId, formData, userId } = req.body;
    if (!adId || !formData) return res.status(400).json({ success: false, message: 'adId and formData are required' });

    // Save the form submission
    const submission = await AdFormSubmission.create({
      adId,
      userId: userId || null,
      formData
    });

    // Only track the formSubmit action
    const actions = { formSubmits: 1 };
    const eventMap = { formSubmits: 'formSubmit' };
    await AdAnalytics.create({
      ad: adId,
      eventType: eventMap.formSubmits,
      user: userId || null,
      timestamp: new Date()
    });
    await Advertisement.findByIdAndUpdate(adId, { $inc: { 'analytics.formSubmits': 1 } });
    // Billing logic
    const ad = await Advertisement.findById(adId);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    const rates = adPricing[ad.adModel][ad.adElements][ad.typeOfAdContent];
    const total = (rates.CPA || 0) * actions.formSubmits;
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
    if (ad.wallet <= 0 && ad.adModel === 'free') ad.isActive = false;
    await ad.save();

    res.status(201).json({
      success: true,
      submission,
      walletBefore,
      walletAfter: ad.wallet,
      cost: total,
      overage: ad.billing.overage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// App installation event (only track install)
exports.submitAppInstallation = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId, userId } = req.body;
    if (!adId) return res.status(400).json({ success: false, message: 'adId is required' });

    // Only track the install action
    const actions = { installs: 1 };
    const eventMap = { installs: 'install' };
    await AdAnalytics.create({
      ad: adId,
      eventType: eventMap.installs,
      user: userId || null,
      timestamp: new Date()
    });
    await Advertisement.findByIdAndUpdate(adId, { $inc: { 'analytics.installs': 1 } });
    // Billing logic
    const ad = await Advertisement.findById(adId);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    const rates = adPricing[ad.adModel][ad.adElements][ad.typeOfAdContent];
    const total = (rates.CPI || 0) * actions.installs;
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
    if (ad.wallet <= 0 && ad.adModel === 'free') ad.isActive = false;
    await ad.save();

    res.status(201).json({
      success: true,
      walletBefore,
      walletAfter: ad.wallet,
      cost: total,
      overage: ad.billing.overage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Website event (only track click)
exports.submitWebsiteEvent = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId, userId } = req.body;
    if (!adId) return res.status(400).json({ success: false, message: 'adId is required' });

    // Only track the click action
    const actions = { clicks: 1 };
    const eventMap = { clicks: 'click' };
    await AdAnalytics.create({
      ad: adId,
      eventType: eventMap.clicks,
      user: userId || null,
      timestamp: new Date()
    });
    await Advertisement.findByIdAndUpdate(adId, { $inc: { 'analytics.clicks': 1 } });
    // Billing logic
    const ad = await Advertisement.findById(adId);
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    const rates = adPricing[ad.adModel][ad.adElements][ad.typeOfAdContent];
    const total = rates.CPC * actions.clicks;
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
    if (ad.wallet <= 0 && ad.adModel === 'free') ad.isActive = false;
    await ad.save();

    res.status(201).json({
      success: true,
      walletBefore,
      walletAfter: ad.wallet,
      cost: total,
      overage: ad.billing.overage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Advertiser fetches all form submissions for an ad
exports.getAdFormSubmissions = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId } = req.body;
    if (!adId) return res.status(400).json({ success: false, message: 'adId is required' });
    const submissions = await AdFormSubmission.find({ adId });
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get ad by ID
exports.getAdById = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { adId } = req.body;
    if (!adId) return res.status(400).json({ success: false, message: 'adId is required' });
    const ad = await Advertisement.findById(adId).populate('business');
    if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
    const adDetails = {
      _id: ad._id,
      business: ad.business,
      typeOfAdContent: ad.typeOfAdContent,
      adContentUrl: ad.adContentUrl,
      adDescription: ad.adDescription,
      adElements: ad.adElements,
      appStoreLink: ad.appStoreLink,
      playStoreLink: ad.playStoreLink,
      adModel: ad.adModel,
      targetedAgeGroup: ad.targetedAgeGroup,
      interests: ad.interests,
      locations: ad.locations,
      status: ad.status,
      uniqueUrl: ad.uniqueUrl,
      createdAt: ad.createdAt,
      formFields: ad.adElements === 'form' ? ad.formFields : undefined
    };
    res.json({ success: true, ad: adDetails });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};