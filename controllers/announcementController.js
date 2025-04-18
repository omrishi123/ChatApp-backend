const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Send a new announcement (broadcast)
exports.sendAnnouncement = async (req, res) => {
  try {
    console.log('ANNOUNCEMENT: sendAnnouncement called. Body:', req.body, 'User:', req.user);
    const { text, pinned } = req.body;
    if (!text) return res.status(400).json({ msg: 'Announcement text required' });
    const announcement = new Announcement({ text, createdBy: req.user.id, pinned: !!pinned });
    await announcement.save();
    console.log('ANNOUNCEMENT: Saved', announcement);
    res.json({ msg: 'Announcement sent', announcement });
  } catch (err) {
    console.error('ANNOUNCEMENT ERROR (sendAnnouncement):', err);
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    console.log('ANNOUNCEMENT: getAnnouncements called. User:', req.user);
    const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('createdBy', 'username email');
    console.log('ANNOUNCEMENT: Fetched', announcements.length, 'announcements');
    res.json(announcements);
  } catch (err) {
    console.error('ANNOUNCEMENT ERROR (getAnnouncements):', err);
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Pin or unpin an announcement
exports.pinAnnouncement = async (req, res) => {
  try {
    console.log('ANNOUNCEMENT: pinAnnouncement called. Body:', req.body, 'User:', req.user);
    const { announcementId, pinned } = req.body;
    await Announcement.findByIdAndUpdate(announcementId, { pinned });
    console.log('ANNOUNCEMENT: Updated pin status for', announcementId, 'to', pinned);
    res.json({ msg: pinned ? 'Announcement pinned' : 'Announcement unpinned' });
  } catch (err) {
    console.error('ANNOUNCEMENT ERROR (pinAnnouncement):', err);
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Public: Get pinned announcements (no auth)
exports.getPublicAnnouncements = async (req, res) => {
  try {
    const pinned = await Announcement.find({ pinned: true }).sort({ createdAt: -1 });
    res.json(pinned);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Delete an announcement (admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    console.log('ANNOUNCEMENT: deleteAnnouncement called. Body:', req.body, 'User:', req.user);
    const { announcementId } = req.body;
    await Announcement.findByIdAndDelete(announcementId);
    console.log('ANNOUNCEMENT: Deleted', announcementId);
    res.json({ msg: 'Announcement deleted' });
  } catch (err) {
    console.error('ANNOUNCEMENT ERROR (deleteAnnouncement):', err);
    res.status(500).json({ msg: 'Server error', err });
  }
};
