const Lead = require('../models/Lead');

// @desc    Get dashboard metrics & trends
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Calculate main counts
    const totalLeads = await Lead.countDocuments({ createdBy: userId });
    const userLeads = await Lead.countDocuments({ createdBy: userId, isDemo: { $ne: true } });
    const globalTotalLeads = await Lead.countDocuments({});
    const activeLeads = await Lead.countDocuments({
      createdBy: userId,
      status: { $in: ['New', 'Contacted', 'Qualified'] }
    });
    const wonDeals = await Lead.countDocuments({ createdBy: userId, status: 'Won' });
    const lostLeads = await Lead.countDocuments({ createdBy: userId, status: 'Lost' });

    // 2. Fetch 5 most recent leads
    const recentLeads = await Lead.find({ createdBy: userId })
      .sort('-createdAt')
      .limit(5);

    // 3. Status breakdown
    const statusCounts = await Lead.aggregate([
      { $match: { createdBy: new (require('mongoose').Types.ObjectId)(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Won: 0,
      Lost: 0
    };

    statusCounts.forEach(item => {
      if (statusBreakdown.hasOwnProperty(item._id)) {
        statusBreakdown[item._id] = item.count;
      }
    });

    // 4. Monthly lead generation stats (for chart)
    const monthlyStats = await Lead.aggregate([
      { $match: { createdBy: new (require('mongoose').Types.ObjectId)(userId) } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Map to a list of month names for the last 6 months or standard months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // We will construct standard counts array for the UI (let's say 12 months with default fallbacks)
    const currentYear = new Date().getFullYear();
    const chartData = monthNames.map((monthName, index) => {
      const monthNum = index + 1;
      const found = monthlyStats.find(item => item._id.month === monthNum && item._id.year === currentYear);
      return {
        month: monthName,
        count: found ? found.count : 0
      };
    });

    // 5. Employee stats (leads added per employee)
    const User = require('../models/User');
    const employeeStats = await User.aggregate([
      {
        $lookup: {
          from: 'leads',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'leads'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          leadCount: { $size: '$leads' }
        }
      },
      {
        $sort: { leadCount: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalLeads,
        userLeads,
        globalTotalLeads,
        activeLeads,
        wonDeals,
        lostLeads
      },
      recentLeads,
      statusBreakdown,
      chartData,
      employeeStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
