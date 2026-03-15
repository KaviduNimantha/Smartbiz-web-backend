const { User, Sale, Product, AiLog } = require('../models');

// Get all registered business owners
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'OWNER' },
      attributes: ['id', 'businessName', 'ownerName', 'email', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// Get profile details for a specific business owner
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id, role: 'OWNER' },
      attributes: ['id', 'businessName', 'ownerName', 'email', 'isActive', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

// Toggle user (business) activation status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ where: { id, role: 'OWNER' } });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle the active state
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { id: user.id, isActive: user.isActive },
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ success: false, message: 'Server error toggling user status' });
  }
};

// Get System-Wide Statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: 'OWNER' } });
    const totalSalesQuantity = await Sale.sum('quantity') || 0;
    const totalRevenue = await Sale.sum('totalPrice') || 0;
    const totalProducts = await Product.count();
    const totalAiQueries = await AiLog.count();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSalesQuantity,
        totalRevenue,
        totalProducts,
        totalAiQueries
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching system stats' });
  }
};

// Get AI Usage Logs
const getAiLogs = async (req, res) => {
  try {
    const logs = await AiLog.findAll({
      include: [{
        model: User,
        attributes: ['businessName', 'email']
      }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching AI logs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching AI logs' });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  toggleUserStatus,
  getSystemStats,
  getAiLogs,
};
