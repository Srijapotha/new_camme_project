const User = require('../models/userModel');
const nodeMailer = require('nodemailer');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');
const { cloudinary } = require('../config/cloudinary');
const axios = require('axios');
const cheerio = require('cheerio');
const { google } = require('googleapis');
const { TwitterApi } = require('twitter-api-v2');
const { IgApiClient } = require('instagram-private-api');

const transPorter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// Get profile by id (expects { userId, email, token } in body)
exports.getProfile = async (req, res) => {    
  try { 
  const verification = await verifyUserTokenAndEmail(req);
  if (!verification.success) return res.status(200).json(verification);
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ success: false, message: 'userId and email required in body' });
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email !== email) return res.status(403).json({ success: false, message: 'Provided email does not match user' });
    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update general profile (theme, profilePic, fullName, userName, about)
exports.updateProfile = async (req, res) => {
  try {
    // Ensure req.body is always an object
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    req.body = body; // Defensive: so downstream always sees an object

    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) return res.status(200).json(verification);

    const { userId, email } = body;
    if (!userId || !email) return res.status(400).json({ success: false, message: 'userId and email required in body' });

    const updates = {};
    const allowed = ['fullName', 'userName', 'about', 'theme'];
    allowed.forEach((k) => { if (body[k] !== undefined) updates[k] = body[k]; });

    // handle profilePic upload (multer puts file in req.file for single, req.files for multiple)
    if (req.file && req.file.path) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, { folder: 'profile_pics' });
      updates.profilePic = uploadRes.secure_url;
    } else if (req.files && req.files.profilePic && req.files.profilePic[0] && req.files.profilePic[0].path) {
      const uploadRes = await cloudinary.uploader.upload(req.files.profilePic[0].path, { folder: 'profile_pics' });
      updates.profilePic = uploadRes.secure_url;
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email !== email) return res.status(403).json({ success: false, message: 'Provided email does not match user' });

    Object.assign(user, updates);
    await user.save();
    return res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Start personal info update: save pending updates and send OTP if email/phone changed
exports.startPersonalInfoUpdate = async (req, res) => {
  try {
  const verification = await verifyUserTokenAndEmail(req);
  if (!verification.success) return res.status(200).json(verification);
    const { userId, email: requesterEmail } = req.body;
    const { phoneNo, email, dateBirth, gender, hidePersonalInfo } = req.body;
    if (!userId || !requesterEmail) return res.status(400).json({ success: false, message: 'userId and email required in body' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email !== requesterEmail) return res.status(403).json({ success: false, message: 'Provided email does not match user' });

    // store pending changes on user._doc to be validated with otp
    user._pendingPersonalUpdate = user._pendingPersonalUpdate || {};
    if (phoneNo) user._pendingPersonalUpdate.phoneNo = phoneNo;
    if (email) user._pendingPersonalUpdate.email = email;
    if (dateBirth) user._pendingPersonalUpdate.dateBirth = dateBirth;
    if (gender) user._pendingPersonalUpdate.gender = gender;
    if (hidePersonalInfo !== undefined) user._pendingPersonalUpdate.hidePersonalInfo = hidePersonalInfo;

    // if email or phone changed -> send otp
    if (phoneNo || email) {
      const otp = generateOtp();
      user._pendingPersonalUpdate.otp = otp;
      user._pendingPersonalUpdate.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min

      // send mail if email present
      const to = email || user.email;
      const mailOptions = { from: process.env.SMTP_USER, to, subject: 'Verify update - OTP', text: `Your OTP is ${otp}` };
      await transPorter.sendMail(mailOptions);
    }

    await user.save();
    return res.json({ success: true, message: 'Pending changes saved, verify OTP if required' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verify OTP and apply personal info updates
exports.verifyPersonalInfoOtp = async (req, res) => {
  try {
  const verification = await verifyUserTokenAndEmail(req);
  if (!verification.success) return res.status(200).json(verification);
    const { userId, email: requesterEmail } = req.body;
    const { otp } = req.body;
    if (!userId || !requesterEmail) return res.status(400).json({ success: false, message: 'userId and email required in body' });
    if (!otp) return res.status(400).json({ success: false, message: 'OTP required' });
    const user = await User.findById(userId);
    if (!user || !user._pendingPersonalUpdate) return res.status(404).json({ success: false, message: 'No pending update found' });
    if (user.email !== requesterEmail) return res.status(403).json({ success: false, message: 'Provided email does not match user' });

    const pending = user._pendingPersonalUpdate;
    if (!pending.otp || pending.otp !== otp || pending.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // apply changes
    ['phoneNo', 'email', 'dateBirth', 'gender', 'hidePersonalInfo'].forEach((k) => {
      if (pending[k] !== undefined) user[k] = pending[k];
    });

    user._pendingPersonalUpdate = undefined;
    await user.save();

    return res.json({ success: true, message: 'Personal info updated', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Interests / Hashtags: replace entire list or allow add/remove
exports.updateInterests = async (req, res) => {
  try {
  const verification = await verifyUserTokenAndEmail(req);
  if (!verification.success) return res.status(200).json(verification);
    const { userId, email } = req.body;
    const { interests, hashtags, action, item } = req.body;
    if (!userId || !email) return res.status(400).json({ success: false, message: 'userId and email required in body' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email !== email) return res.status(403).json({ success: false, message: 'Provided email does not match user' });

    // ensure arrays exist
    user.interests = user.interests || [];
    user.hashtags = user.hashtags || [];

    if (action === 'replace') {
      if (Array.isArray(interests)) user.interests = interests;
      if (Array.isArray(hashtags)) user.hashtags = hashtags;
    } else if (action === 'add' && item) {
      if (item.type === 'interest' && !user.interests.includes(item.value)) user.interests.push(item.value);
      if (item.type === 'hashtag' && !user.hashtags.includes(item.value)) user.hashtags.push(item.value);
    } else if (action === 'remove' && item) {
      if (item.type === 'interest') user.interests = user.interests.filter(i => i !== item.value);
      if (item.type === 'hashtag') user.hashtags = user.hashtags.filter(h => h !== item.value);
    }

    await user.save();
    return res.json({ success: true, message: 'Interests updated', interests: user.interests, hashtags: user.hashtags });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Social media linking - add or remove (supports single platform or batch via `accounts` array/object)
exports.updateSocialAccounts = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) return res.status(200).json(verification);

    const { userId, email, socialLinks, hideSocial } = req.body;
    if (!userId || !email) return res.status(400).json({ success: false, message: 'userId and email required in body' });
    if (!Array.isArray(socialLinks)) return res.status(400).json({ success: false, message: 'socialLinks array required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email !== email) return res.status(403).json({ success: false, message: 'Provided email does not match user' });

    const aliasMap = { twitter: 'x', snap: 'snapchat', 'snap-chat': 'snapchat' };
    const PLATFORM_TIERS = {
      youtube: [
        { name: 'Macro', min: 1000000, score: 125000, tedGold: 6250, tedSilver: 12500, tedBronze: 18750 },
        { name: 'Mid', min: 50000, score: 45000, tedGold: 2250, tedSilver: 4500, tedBronze: 6750 },
        { name: 'Micro', min: 10000, score: 7500, tedGold: 375, tedSilver: 750, tedBronze: 1125 },
        { name: 'Nano', min: 1000, score: 2000, tedGold: 100, tedSilver: 200, tedBronze: 300 },
      ],
      snapchat: [
        { name: 'Macro', min: 100000, score: 65000, tedGold: 3250, tedSilver: 6500, tedBronze: 9750 },
        { name: 'Mid', min: 50000, score: 35000, tedGold: 1750, tedSilver: 3500, tedBronze: 5250 },
        { name: 'Micro', min: 10000, score: 4500, tedGold: 225, tedSilver: 450, tedBronze: 675 },
        { name: 'Nano', min: 5000, score: 3000, tedGold: 150, tedSilver: 300, tedBronze: 450 },
      ],
      x: [
        { name: 'Macro', min: 100000, score: 45000, tedGold: 2250, tedSilver: 4500, tedBronze: 6750 },
        { name: 'Mid', min: 50000, score: 20000, tedGold: 1000, tedSilver: 2000, tedBronze: 3000 },
        { name: 'Micro', min: 10000, score: 5000, tedGold: 250, tedSilver: 500, tedBronze: 750 },
        { name: 'Nano', min: 5000, score: 1500, tedGold: 75, tedSilver: 150, tedBronze: 225 },
      ],
      instagram: [
        { name: 'Macro', min: 100000, score: 70500, tedGold: 3525, tedSilver: 7050, tedBronze: 10575 },
        { name: 'Mid', min: 50000, score: 30000, tedGold: 1500, tedSilver: 3000, tedBronze: 4500 },
        { name: 'Micro', min: 10000, score: 3500, tedGold: 175, tedSilver: 350, tedBronze: 525 },
        { name: 'Nano', min: 1000, score: 1000, tedGold: 50, tedSilver: 100, tedBronze: 150 },
      ],
      facebook: [
        { name: 'Macro', min: 100000, score: 75000, tedGold: 3750, tedSilver: 7500, tedBronze: 11250 },
        { name: 'Mid', min: 50000, score: 55000, tedGold: 2750, tedSilver: 5500, tedBronze: 8250 },
        { name: 'Micro', min: 10000, score: 4000, tedGold: 200, tedSilver: 400, tedBronze: 600 },
        { name: 'Nano', min: 1000, score: 600, tedGold: 30, tedSilver: 60, tedBronze: 90 },
      ],
      threads: [
        { name: 'Macro', min: 100000, score: 65000, tedGold: 3250, tedSilver: 6500, tedBronze: 9750 },
        { name: 'Mid', min: 50000, score: 35000, tedGold: 1750, tedSilver: 3500, tedBronze: 5250 },
        { name: 'Micro', min: 10000, score: 3000, tedGold: 150, tedSilver: 300, tedBronze: 450 },
        { name: 'Nano', min: 1000, score: 800, tedGold: 40, tedSilver: 80, tedBronze: 120 },
      ],
      linkedin: [
        { name: 'Macro', min: 50000, score: 75000, tedGold: 3750, tedSilver: 7500, tedBronze: 11250 },
        { name: 'Growing', min: 10000, score: 39500, tedGold: 1975, tedSilver: 3950, tedBronze: 5925 },
        { name: 'Micro', min: 5000, score: 7500, tedGold: 375, tedSilver: 750, tedBronze: 1125 },
        { name: 'Nano', min: 1000, score: 2000, tedGold: 100, tedSilver: 200, tedBronze: 300 },
      ],
      pinterest: [
        { name: 'Macro', min: 100000, score: 85000, tedGold: 4250, tedSilver: 8500, tedBronze: 12750 },
        { name: 'Mid', min: 50000, score: 60000, tedGold: 3000, tedSilver: 6000, tedBronze: 9000 },
        { name: 'Micro', min: 5000, score: 5500, tedGold: 275, tedSilver: 550, tedBronze: 825 },
        { name: 'Nano', min: 1000, score: 1200, tedGold: 60, tedSilver: 120, tedBronze: 180 },
      ],
    };

    const validateUrlForPlatform = (pl, u) => {
      if (!u) return true; // not required
      try {
        const parsed = new URL(u);
        const host = parsed.hostname.toLowerCase();
        const mapping = {
          youtube: ['youtube.com', 'youtu.be'],
          snapchat: ['snapchat.com'],
          x: ['twitter.com', 'x.com'],
          instagram: ['instagram.com'],
          facebook: ['facebook.com', 'fb.com'],
          threads: ['threads.net', 'threads.com'], // <-- add threads.com here
          linkedin: ['linkedin.com'],
          pinterest: ['pinterest.com'],
        };
        const okHosts = mapping[pl] || [];
        return okHosts.some(h => host.endsWith(h));
      } catch (e) {
        return false;
      }
    };

    // Helper: fetch followers count from social media link (realistic demo for Instagram, X, YouTube)
    async function fetchFollowersFromLink(platform, url) {
      try {
        if (!platform || !url) return 0;
        platform = platform.toLowerCase();

        // Linkedin
        if (platform === 'linkedin') {
          // LinkedIn does not provide public follower count for personal profiles via scraping or API.
          // Attempting to scrape will result in status 999 (Request denied).
          // For company pages, you could use the LinkedIn API (requires special permissions).
          // For personal profiles, always return 0.
          return 0;
        }

        // Helper functions to extract IDs/usernames
        const extractChannelId = async (url) => {
          const channelMatch = url.match(/\/channel\/([UC][\w-]+)/);
          if (channelMatch) return channelMatch[1];

          // Handle @username URLs
          const usernameMatch = url.match(/\/@([^\/]+)/);
          if (usernameMatch) {
            const username = usernameMatch[1];
            const youtube = google.youtube('v3');
            const searchResponse = await youtube.search.list({
              key: process.env.YOUTUBE_API_KEY,
              part: 'snippet',
              q: `@${username}`,
              type: 'channel',
              maxResults: 1
            });
            if (searchResponse.data.items && searchResponse.data.items.length > 0) {
              return searchResponse.data.items[0].snippet.channelId;
            }
          }

          return null; // Placeholder
        };

        const extractUsername = (url) => {
          const match = url.match(/\/([^\/]+)\/?$/);
          return match ? match[1] : null;
        };

        // YouTube
        if (platform === 'youtube') {
          const youtube = google.youtube('v3');
          const channelId = await extractChannelId(url);
          if (!channelId) return 0; // Fallback if extraction fails
          const response = await youtube.channels.list({
            key: process.env.YOUTUBE_API_KEY,
            part: 'statistics',
            id: channelId
          });
          return Number(response.data.items[0].statistics.subscriberCount);
        }

        // Instagram
        if (platform === 'instagram') {
          try {
            const ig = new IgApiClient();
            ig.state.generateDevice(process.env.IG_USERNAME);
            await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
            const username = extractUsername(url);
            if (!username) return 0;
            const user = await ig.user.searchExact(username);
            return user.follower_count;
          } catch (err) {
            // If login fails (e.g., bad credentials or IG blocks), fallback to scraping below
            // console.warn('Instagram API login failed, falling back to scraping');
          }
        }

        // Twitter/X
        if (platform === 'x' || platform === 'twitter') {
          try {
            const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
            const username = extractUsername(url);
            if (!username) return 0;
            const user = await client.v2.userByUsername(username, { 'user.fields': 'public_metrics' });
            if (
              user &&
              user.data &&
              user.data.public_metrics &&
              typeof user.data.public_metrics.followers_count === 'number'
            ) {
              return user.data.public_metrics.followers_count;
            }
            // If structure is not as expected, fallback to scraping below
          } catch (err) {
            // If 401 Unauthorized or any error, fallback to scraping below
            if (err && err.code === 401) {
              // Optionally log: console.warn('Twitter API unauthorized, falling back to scraping');
            } else {
              // Optionally log other errors
              // console.error('Twitter API error:', err);
            }
            // Continue to scraping below
          }
        }

        // Threads
        if (platform === 'threads') {
          // Try scraping the followers count from the page
          const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const $ = cheerio.load(res.data);
          // Try meta tag
          const meta = $('meta[property="og:description"]').attr('content');
          // Updated regex: matches numbers with optional decimal and K/M suffix
          const followersRegex = /([\d,.]+(?:\.\d+)?[kKmM]?)\s*Followers?/i;
          if (meta) {
            const match = meta.match(followersRegex);
            if (match) {
              let count = match[1].replace(/,/g, '');
              if (/k$/i.test(count)) count = parseFloat(count) * 1000;
              else if (/m$/i.test(count)) count = parseFloat(count) * 1000000;
              else count = parseFloat(count);
              return Math.round(Number(count));
            }
          }
          // Fallback: look for " followers" in text
          const text = $('body').text();
          const match = text.match(followersRegex);
          if (match) {
            let count = match[1].replace(/,/g, '');
            if (/k$/i.test(count)) count = parseFloat(count) * 1000;
            else if (/m$/i.test(count)) count = parseFloat(count) * 1000000;
            else count = parseFloat(count);
            return Math.round(Number(count));
          }
          return 0;
        }

        // Pinterest
        if (platform === 'pinterest') {
          // Try scraping the followers count from the page
          const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const $ = cheerio.load(res.data);
          // Try meta tag
          const meta = $('meta[name="description"]').attr('content');
          if (meta) {
            // Example: "1,234 followers, 56 following"
            const match = meta.match(/([\d,.]+)\sfollowers/i);
            if (match) {
              let count = match[1].replace(/,/g, '');
              if (count.includes('k')) count = parseFloat(count) * 1000;
              else if (count.includes('m')) count = parseFloat(count) * 1000000;
              return Math.round(Number(count));
            }
          }
          // Fallback: look for " followers" in text
          const text = $('body').text();
          const match = text.match(/([\d,.]+)\sfollowers/i);
          if (match) {
            let count = match[1].replace(/,/g, '');
            if (count.includes('k')) count = parseFloat(count) * 1000;
            else if (count.includes('m')) count = parseFloat(count) * 1000000;
            return Math.round(Number(count));
          }
          return 0;
        }

        // Fallback to web scraping for other platforms
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(res.data);
        // Instagram
        if (platform === 'instagram') {
          // Try meta tag first
          const meta = $('meta[property="og:description"]').attr('content');
          if (meta) {
            const match = meta.match(/([\d,.]+)\sFollowers/);
            if (match) {
              let count = match[1].replace(/,/g, '');
              if (count.includes('k')) count = parseFloat(count) * 1000;
              else if (count.includes('m')) count = parseFloat(count) * 1000000;
              return Math.round(Number(count));
            }
          }
          // Fallback: look for " followers" in text
          const text = $('body').text();
          const match = text.match(/([\d,.]+)\sfollowers/i);
          if (match) {
            let count = match[1].replace(/,/g, '');
            if (count.includes('k')) count = parseFloat(count) * 1000;
            else if (count.includes('m')) count = parseFloat(count) * 1000000;
            return Math.round(Number(count));
          }
        }
        // Twitter/X
        if (platform === 'x' || platform === 'twitter') {
          // Try meta tag
          const meta = $('meta[name="description"]').attr('content');
          if (meta) {
            const match = meta.match(/([\d,.]+)\sFollowers/);
            if (match) {
              let count = match[1].replace(/,/g, '');
              if (count.includes('k')) count = parseFloat(count) * 1000;
              else if (count.includes('m')) count = parseFloat(count) * 1000000;
              return Math.round(Number(count));
            }
          }
          // Fallback: look for " followers" in text
          const text = $('body').text();
          const match = text.match(/([\d,.]+)\sFollowers/i);
          if (match) {
            let count = match[1].replace(/,/g, '');
            if (count.includes('k')) count = parseFloat(count) * 1000;
            else if (count.includes('m')) count = parseFloat(count) * 1000000;
            return Math.round(Number(count));
          }
        }

        return 12345; // For other platforms, return dummy value
      } catch (err) {
        console.error(`Error fetching ${platform} followers:`, err);
        return 0;
      }
    }

    const results = [];
    user.social = user.social || {};

    // Helper: Try to extract owner email/phone from social profile page (best effort, platform-specific)
    async function extractOwnerInfoFromUrl(platform, url) {
      try {
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(res.data);
        let text = $('body').text() || '';

        // Try meta tags for description/bio
        let metaDesc = $('meta[name="description"]').attr('content') || '';
        let ogDesc = $('meta[property="og:description"]').attr('content') || '';
        let allText = [text, metaDesc, ogDesc].join(' ');

        // Email pattern
        const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

        // Phone pattern (basic, international and local)
        const phoneMatch = allText.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,6}/);

        // Platform-specific tweaks (bio/description extraction)
        switch (platform) {
          case 'instagram':
            // Instagram: try to get from bio (meta or visible)
            if (!emailMatch) {
              const bio = $('meta[property="og:description"]').attr('content') || '';
              const bioEmail = bio.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (bioEmail) return { ownerEmail: bioEmail[0], ownerPhone: phoneMatch ? phoneMatch[0] : null };
            }
            break;
          case 'facebook':
            // Facebook: try to get from About section
            if (!emailMatch) {
              const about = $('div[data-testid="profile_intro_card_bio"]').text() || '';
              const aboutEmail = about.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (aboutEmail) return { ownerEmail: aboutEmail[0], ownerPhone: phoneMatch ? phoneMatch[0] : null };
            }
            break;
          case 'linkedin':
            // LinkedIn: try to get from summary/description
            if (!emailMatch) {
              const summary = $('section.pv-about-section').text() || '';
              const summaryEmail = summary.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (summaryEmail) return { ownerEmail: summaryEmail[0], ownerPhone: phoneMatch ? phoneMatch[0] : null };
            }
            break;
          case 'x':
          case 'twitter':
            // Twitter/X: try to get from bio
            if (!emailMatch) {
              const bio = $('div[data-testid="UserDescription"]').text() || '';
              const bioEmail = bio.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (bioEmail) return { ownerEmail: bioEmail[0], ownerPhone: phoneMatch ? phoneMatch[0] : null };
            }
            break;
          case 'youtube':
            // YouTube: try to get from description
            if (!emailMatch) {
              const desc = $('meta[name="description"]').attr('content') || '';
              const descEmail = desc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (descEmail) return { ownerEmail: descEmail[0], ownerPhone: phoneMatch ? phoneMatch[0] : null };
            }
            break;
          case 'snapchat':
          case 'threads':
          case 'pinterest':
            // For these, just use the general extraction above
            break;
          default:
            break;
        }

        return {
          ownerEmail: emailMatch ? emailMatch[0] : null,
          ownerPhone: phoneMatch ? phoneMatch[0] : null,
        };
      } catch (err) {
        return { ownerEmail: null, ownerPhone: null };
      }
    }

    for (const link of socialLinks) {
      const { platform, url } = link;
      if (!platform || !url) {
        results.push({ success: false, platform: platform || null, message: 'platform and url required' });
        continue;
      }
      const p = (aliasMap[platform.toLowerCase()] || platform).toLowerCase();
      if (!validateUrlForPlatform(p, url)) {
        results.push({ success: false, platform: p, message: 'Invalid URL for ' + p });
        continue;
      }

      // Check if already exists in socialMedia array
      const alreadyExists = user.socialMedia.some(sm => sm.platform === p);
      if (alreadyExists) {
        results.push({ success: false, platform: p, message: 'Already linked' });
        continue;
      }

      // Extract owner info from URL (best effort)
      const { ownerEmail, ownerPhone } = await extractOwnerInfoFromUrl(p, url);

      // Only match if extracted ownerEmail/ownerPhone matches user's email/phoneNo
      const emailMatches = ownerEmail && user.email && ownerEmail.toLowerCase() === user.email.toLowerCase();
      const phoneMatches = ownerPhone && user.phoneNo && ownerPhone === user.phoneNo;

      try {
        const followers = await fetchFollowersFromLink(p, url);
        if (isNaN(followers) || followers < 0) throw new Error('Could not fetch followers count for ' + p);

        // compute tier and award delta points/coins only if email or phone matches
        let tier = null;
        if (PLATFORM_TIERS[p]) {
          const tiers = PLATFORM_TIERS[p];
          let selected = null;
          for (const t of tiers) {
            if (followers >= t.min) { selected = t; break; }
          }
          if (!selected) selected = tiers[tiers.length - 1];
          tier = selected.name;

          // Only add points/coins if email or phone matches
          if (emailMatches || phoneMatches) {
            const newScore = Number(selected.score || 0);
            if (newScore > 0) user.points = (user.points || 0) + newScore;

            user.coinWallet = user.coinWallet || {};
            user.coinWallet.tedGold = (user.coinWallet.tedGold || 0) + Number(selected.tedGold || 0);
            user.coinWallet.tedSilver = (user.coinWallet.tedSilver || 0) + Number(selected.tedSilver || 0);
            user.coinWallet.tedBronze = (user.coinWallet.tedBronze || 0) + Number(selected.tedBronze || 0);
          }
        }

        // Add to socialMedia array
        user.socialMedia.push({
          platform: p,
          linked: true,
          followers,
          url,
          verifiedEmail: !!emailMatches,
          verifiedPhone: !!phoneMatches,
          lastChecked: new Date(),
          tier
        });

        results.push({ success: true, platform: p, linked: true, followers, tier, pointsAdded: !!(emailMatches || phoneMatches) });
      } catch (e) {
        results.push({ success: false, platform: p, message: e.message });
      }
    }

    if (hideSocial !== undefined) user.hideSocial = !!hideSocial;

    await user.save();

    return res.json({ success: true, message: 'Social accounts processed', results, user, socialMedia: user.socialMedia, points: user.points, coinWallet: user.coinWallet });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// New: get influencer report per-platform and totals
exports.getInfluencerReport = async (req, res) => {
  try {
  const verification = await verifyUserTokenAndEmail(req);
  if (!verification.success) return res.status(200).json(verification);
    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ success: false, message: 'userId and email required in body' });
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email !== email) return res.status(403).json({ success: false, message: 'Provided email does not match user' });

    const social = user.social || {};
    const report = {};
    let totalFollowers = 0;
    for (const p of Object.keys(social)) {
      const s = social[p] || {};
      report[p] = {
        linked: !!s.linked,
        url: s.url || null,
        followers: s.followers || 0,
        tier: s.tier || null,
      };
      totalFollowers += Number(s.followers || 0);
    }

    return res.json({ success: true, report, totalFollowers, points: user.points, coinWallet: user.coinWallet });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Clear socialMedia array for a user by userId
exports.clearSocialMedia = async (req, res) => {
  try {
    // Verification step
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) return res.status(200).json(verification);

    const { userId, email } = req.body;
    if (!userId || !email) return res.status(400).json({ success: false, message: 'userId and email required in body' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.email !== email) return res.status(403).json({ success: false, message: 'Provided email does not match user' });
    user.socialMedia = [];
    await user.save();
    return res.json({ success: true, message: 'socialMedia cleared', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
