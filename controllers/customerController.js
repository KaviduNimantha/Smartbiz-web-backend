const { Customer, Sale, Product, Stock } = require('../models');
const { sequelize } = require('../db/db');

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
};

// Add a new customer and decrease inventory/create sale
const addCustomer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { customerName, productName, quantity, unitPrice, date } = req.body;
    const userId = req.user.id;
    const parsedQuantity = parseInt(quantity, 10);
    const parsedPrice = parseFloat(unitPrice);
    const totalPrice = parsedQuantity * parsedPrice;

    // 1. Check if product exists and stock is sufficient
    const product = await Product.findOne({ where: { productName, userId }, transaction: t });
    if (!product) {
       await t.rollback();
       return res.status(404).json({ success: false, message: `Product '${productName}' not found in inventory` });
    }

    const stock = await Stock.findOne({ where: { productId: product.id, userId }, transaction: t });
    if (!stock || stock.quantity < parsedQuantity) {
       await t.rollback();
       return res.status(400).json({ success: false, message: `Insufficient stock for product '${productName}'` });
    }

    // 2. Decrease Stock
    stock.quantity -= parsedQuantity;
    await stock.save({ transaction: t });

    // 3. Create Customer
    const newCustomer = await Customer.create(
      { customerName, productName, quantity: parsedQuantity, unitPrice: parsedPrice, date: date || new Date(), userId },
      { transaction: t }
    );

    // 4. Create Sale
    await Sale.create(
      { customerId: newCustomer.id, productName, quantity: parsedQuantity, totalPrice, date: date || new Date(), userId },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ success: true, message: 'Customer added, stock updated, and sale recorded', data: newCustomer });
  } catch (error) {
    await t.rollback();
    console.error('Error adding customer:', error);
    res.status(500).json({ success: false, message: 'Server error adding customer' });
  }
};

// Update a customer (and adjust stock/sales if quantity/price changes)
const updateCustomer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { customerName, quantity, unitPrice, date } = req.body;
    const userId = req.user.id;

    const customer = await Customer.findOne({ where: { id, userId }, transaction: t });
    if (!customer) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Notice: We don't support changing the productName to keep the flow safe.
    
    // Adjust Stock if quantity changed
    if (quantity !== undefined && quantity !== customer.quantity) {
      const parsedQuantity = parseInt(quantity, 10);
      const quantityDifference = parsedQuantity - customer.quantity; // Positive if they bought more

      const product = await Product.findOne({ where: { productName: customer.productName, userId }, transaction: t });
      if (product) {
        const stock = await Stock.findOne({ where: { productId: product.id, userId }, transaction: t });
        if (stock) {
          if (quantityDifference > 0 && stock.quantity < quantityDifference) {
             await t.rollback();
             return res.status(400).json({ success: false, message: 'Insufficient stock to increase customer order' });
          }
          stock.quantity -= quantityDifference; 
          await stock.save({ transaction: t });
        }
      }
      customer.quantity = parsedQuantity;
    }

    // Update Customer details
    customer.customerName = customerName || customer.customerName;
    customer.unitPrice = unitPrice !== undefined ? parseFloat(unitPrice) : customer.unitPrice;
    customer.date = date || customer.date;
    await customer.save({ transaction: t });

    // Update Sale details
    const sale = await Sale.findOne({ where: { customerId: customer.id, userId }, transaction: t });
    if (sale) {
      sale.quantity = customer.quantity;
      sale.totalPrice = customer.quantity * customer.unitPrice;
      sale.date = customer.date;
      await sale.save({ transaction: t });
    }

    await t.commit();
    res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
  } catch (error) {
    await t.rollback();
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Server error updating customer' });
  }
};

// Delete a customer (Restore stock, delete sale)
const deleteCustomer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const customer = await Customer.findOne({ where: { id, userId }, transaction: t });
    if (!customer) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Restore stock
    const product = await Product.findOne({ where: { productName: customer.productName, userId }, transaction: t });
    if (product) {
      const stock = await Stock.findOne({ where: { productId: product.id, userId }, transaction: t });
      if (stock) {
        stock.quantity += customer.quantity;
        await stock.save({ transaction: t });
      }
    }

    // Sale record is usually deleted via cascading delete if FK is set to CASCADE,
    // but we can manually delete it for safety
    await Sale.destroy({ where: { customerId: customer.id, userId }, transaction: t });

    await customer.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({ success: true, message: 'Customer deleted, sale removed, and stock restored' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Server error deleting customer' });
  }
};

module.exports = {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
};
