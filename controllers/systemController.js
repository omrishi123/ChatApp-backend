const os = require('os');
const { exec } = require('child_process');

// Server health endpoint
exports.getHealth = async (req, res) => {
  try {
    res.json({
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      platform: os.platform(),
      cpu: os.cpus(),
      load: os.loadavg(),
      freeMem: os.freemem(),
      totalMem: os.totalmem(),
      time: new Date()
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Trigger DB backup (dummy implementation)
exports.triggerBackup = async (req, res) => {
  try {
    // Replace with actual backup logic as needed
    exec('echo "Backup triggered"', (error, stdout, stderr) => {
      if (error) return res.status(500).json({ msg: 'Backup failed', error });
      res.json({ msg: 'Backup triggered', output: stdout });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};

// Trigger DB restore (dummy implementation)
exports.triggerRestore = async (req, res) => {
  try {
    // Replace with actual restore logic as needed
    exec('echo "Restore triggered"', (error, stdout, stderr) => {
      if (error) return res.status(500).json({ msg: 'Restore failed', error });
      res.json({ msg: 'Restore triggered', output: stdout });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', err });
  }
};
