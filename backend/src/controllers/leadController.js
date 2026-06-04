const Lead = require('../models/Lead');

// @desc    Get all leads (with search, filter, pagination)
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { createdBy: req.user.id };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: leads.length,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limitNum),
      currentPage: pageNum,
      leads,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, value, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Please provide name and email' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      status,
      value: value ? Number(value) : 0,
      notes,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lead details
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this lead' });
    }

    const { name, email, phone, company, status, value, notes } = req.body;

    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, company, status, value: value ? Number(value) : 0, notes },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this lead' });
    }

    await lead.deleteOne();

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update only lead status
// @route   PATCH /api/leads/:id/status
// @access  Private
exports.patchLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['New', 'Contacted', 'Qualified', 'Won', 'Lost'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status type' });
    }

    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this lead' });
    }

    lead.status = status;
    await lead.save();

    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
