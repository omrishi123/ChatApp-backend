const KeywordFilter = require('../models/KeywordFilter');

// Get all keywords
exports.getKeywords = async (req, res) => {
  try {
    const keywords = await KeywordFilter.find();
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Add a new keyword
exports.addKeyword = async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) return res.status(400).json({ msg: 'Keyword required' });
    const exists = await KeywordFilter.findOne({ word });
    if (exists) return res.status(400).json({ msg: 'Keyword already exists' });
    const keyword = new KeywordFilter({ word });
    await keyword.save();
    res.json(keyword);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Remove a keyword
exports.removeKeyword = async (req, res) => {
  try {
    const { word } = req.body;
    await KeywordFilter.deleteOne({ word });
    res.json({ msg: 'Keyword removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
