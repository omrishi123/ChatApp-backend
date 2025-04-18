const Report = require('../models/Report');
const Message = require('../models/Message');
const User = require('../models/User');

// Report a message
exports.reportMessage = async (req, res) => {
  try {
    const { messageId, reason } = req.body;
    const report = new Report({
      message: messageId,
      reporter: req.user.id,
      reason
    });
    await report.save();
    res.json({ msg: 'Message reported' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Get all reports (admin)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('message reporter');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Resolve a report (admin)
exports.resolveReport = async (req, res) => {
  try {
    const { reportId } = req.body;
    await Report.findByIdAndUpdate(reportId, { resolved: true });
    res.json({ msg: 'Report resolved' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
