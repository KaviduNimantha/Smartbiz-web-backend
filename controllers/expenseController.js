const { Expense } = require('../models');

// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
};

// Add a new expense
const addExpense = async (req, res) => {
  try {
    const { title, amount, date } = req.body;
    const userId = req.user.id;

    const newExpense = await Expense.create({
      title,
      amount,
      date: date || new Date(),
      userId,
    });

    res.status(201).json({ success: true, message: 'Expense added successfully', data: newExpense });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ success: false, message: 'Server error adding expense' });
  }
};

// Update an existing expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, date } = req.body;
    const userId = req.user.id;

    const expense = await Expense.findOne({ where: { id, userId } });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    expense.title = title || expense.title;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.date = date || expense.date;

    await expense.save();

    res.status(200).json({ success: true, message: 'Expense updated successfully', data: expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Server error updating expense' });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOne({ where: { id, userId } });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.destroy();

    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
};
