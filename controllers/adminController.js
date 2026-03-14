const { User } = require('../models');

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

module.exports = {
  getAllUsers,
  getUserProfile,
  toggleUserStatus,
};
