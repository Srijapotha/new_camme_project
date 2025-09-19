const mongoose = require('mongoose');
const { verifyUserTokenAndEmail } = require('../middleware/addirionalSecurity');

// Dynamic models for flexible schema
const Country = mongoose.model('countries', new mongoose.Schema({}, { strict: false }));
const State = mongoose.model('states', new mongoose.Schema({}, { strict: false }));
const City = mongoose.model('cities', new mongoose.Schema({}, { strict: false }));
const Region = mongoose.model('regions', new mongoose.Schema({}, { strict: false }));

exports.getCountries = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const countries = await Country.find({});
    res.json({ success: true, countries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStatesByCountry = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { countryId } = req.body;
    if (!countryId) return res.status(400).json({ success: false, message: 'countryId is required' });
    const states = await State.find({ country_id: countryId });
    res.json({ success: true, states });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCitiesByState = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { stateId } = req.body;
    if (!stateId) return res.status(400).json({ success: false, message: 'stateId is required' });
    const cities = await City.find({ state_id: stateId });
    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRegionsByState = async (req, res) => {
  try {
    const verification = await verifyUserTokenAndEmail(req);
    if (!verification.success) {
      return res.status(200).json(verification);
    }
    const { stateId } = req.body;
    if (!stateId) return res.status(400).json({ success: false, message: 'stateId is required' });
    const regions = await Region.find({ state_id: stateId });
    res.json({ success: true, regions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
