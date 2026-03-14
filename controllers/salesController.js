const { Sale, Customer } = require('../models');

// Get all sales for a user
const getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Customer,
          attributes: ['customerName'],
        },
      ],
      order: [['date', 'DESC']],
    });
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ success: false, message: 'Server error fetching sales' });
  }
};

module.exports = {
  getSales,
};
