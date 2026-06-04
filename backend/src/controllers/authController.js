const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey_spandsons_mini_crm_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Auto-seed demo leads for the user so the dashboard is instantly visual and interactive
      const Lead = require('../models/Lead');
      const demoLeads = [
        { name: 'Jordan Sterling', email: 'j.sterling@sterling.digital', phone: '+1 (555) 019-2834', company: 'Sterling Digital', status: 'New', value: 12500, notes: 'Met at Web Summit. Interested in enterprise CRM migration.', createdBy: user._id },
        { name: 'Aisha Mahmoud', email: 'a.mahmoud@global.logistics', phone: '+1 (555) 018-9283', company: 'Global Logistics', status: 'Won', value: 45000, notes: 'Deal closed. Onboarding scheduled for next week.', createdBy: user._id },
        { name: 'Thomas Reed', email: 't.reed@reedco.com', phone: '+1 (555) 017-3829', company: 'Reed & Co', status: 'Lost', value: 8200, notes: 'Went with a competitor due to budget constraints.', createdBy: user._id },
        { name: 'Elena Belova', email: 'e.belova@techventures.io', phone: '+1 (555) 016-4820', company: 'TechVentures', status: 'Qualified', value: 62000, notes: 'In discussions regarding custom API integrations.', createdBy: user._id },
        { name: 'Sarah Jenkins', email: 's.jenkins@nexus.io', phone: '+1 (555) 012-3456', company: 'Nexus Dynamics', status: 'Qualified', value: 25000, notes: 'Sent proposal. Waiting for feedback.', createdBy: user._id },
        { name: 'Marcus Thorne', email: 'm.thorne@lumina.com', phone: '+1 (555) 987-6543', company: 'Lumina Systems', status: 'New', value: 15000, notes: 'Inbound inquiry for sales automation.', createdBy: user._id },
        { name: 'Elena Rodriguez', email: 'elena.r@veloci.global', phone: '+1 (555) 234-5678', company: 'Veloci Global', status: 'Contacted', value: 30000, notes: 'Had initial discovery call. Scheduled demo next Tuesday.', createdBy: user._id },
        { name: 'David Chen', email: 'd.chen@zenith.com', phone: '+1 (555) 345-6789', company: 'Zenith Venture', status: 'Won', value: 50000, notes: 'Signed annual contract. Starting implementation.', createdBy: user._id },
        { name: 'Alisha Patel', email: 'a.patel@spark.io', phone: '+1 (555) 456-7890', company: 'Spark Innovation', status: 'Lost', value: 11000, notes: 'Budget frozen for this quarter.', createdBy: user._id }
      ];
      await Lead.insertMany(demoLeads);

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
