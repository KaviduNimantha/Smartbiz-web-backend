const { Product, Stock } = require('../models');

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Stock,
          attributes: ['quantity'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

module.exports = {
  getProducts,
};
