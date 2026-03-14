const { Sale, Expense, Product } = require('../models');
const { sequelize } = require('../db/db');

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Calculate Total Sales
    const totalSalesResult = await Sale.findOne({
      where: { userId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalSales']
      ]
    });
    const totalSales = totalSalesResult ? parseFloat(totalSalesResult.getDataValue('totalSales')) || 0 : 0;

    // 2. Calculate Total Expenses
    const totalExpensesResult = await Expense.findOne({
      where: { userId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalExpenses']
      ]
    });
    const totalExpenses = totalExpensesResult ? parseFloat(totalExpensesResult.getDataValue('totalExpenses')) || 0 : 0;

    // 3. Calculate Total Profit
    const totalProfit = totalSales - totalExpenses;

    // 4. Calculate Total Products
    const totalProducts = await Product.count({
      where: { userId }
    });

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalExpenses,
        totalProfit,
        totalProducts
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard' });
  }
};

module.exports = {
  getDashboardOverview,
};
