const { Supplier, Product, Stock } = require('../models');
const { sequelize } = require('../db/db');

// Get all suppliers for a business owner
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add a new supplier and update inventory
const addSupplier = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { supplierName, productName, quantity, price, date } = req.body;
    const userId = req.user.id;

    // 1. Create Supplier Entry
    const newSupplier = await Supplier.create(
      { supplierName, productName, quantity, price, date: date || new Date(), userId },
      { transaction: t }
    );

    // 2. Check if Product exists for this user
    let product = await Product.findOne({
      where: { productName, userId },
      transaction: t,
    });

    if (!product) {
      // Create Product if it doesn't exist
      product = await Product.create(
        { productName, price, description: `Supplied by ${supplierName}`, userId },
        { transaction: t }
      );
    }

    // 3. Update or Create Stock
    let stock = await Stock.findOne({
      where: { productId: product.id, userId },
      transaction: t,
    });

    if (stock) {
      // Update existing stock
      stock.quantity += parseInt(quantity, 10);
      await stock.save({ transaction: t });
    } else {
      // Create new stock
      await Stock.create(
        { quantity, productId: product.id, userId },
        { transaction: t }
      );
    }

    // Commit transaction
    await t.commit();
    res.status(201).json({ success: true, message: 'Supplier added and inventory updated', data: newSupplier });
  } catch (error) {
    // Rollback on error
    await t.rollback();
    console.error('Error adding supplier:', error);
    res.status(500).json({ success: false, message: 'Server error adding supplier' });
  }
};

// Update an existing supplier (and adjust inventory if quantity changes)
const updateSupplier = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { supplierName, productName, quantity, price, date } = req.body;
    const userId = req.user.id;

    const supplier = await Supplier.findOne({ where: { id, userId }, transaction: t });
    if (!supplier) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const quantityDifference = parseInt(quantity, 10) - supplier.quantity;
    const productChanged = supplier.productName !== productName;

    // We keep things simple for now: if product name changes, it's complex to revert old product stock and add to new.
    // For this basic flow, we highly recommend not changing the productName.
    // Let's just handle simple quantity updates if the productName is the same.
    if (!productChanged && quantityDifference !== 0) {
      const product = await Product.findOne({ where: { productName: supplier.productName, userId }, transaction: t });
      if (product) {
        const stock = await Stock.findOne({ where: { productId: product.id, userId }, transaction: t });
        if (stock) {
          stock.quantity += quantityDifference;
          await stock.save({ transaction: t });
        }
      }
    }

    // Update supplier record
    supplier.supplierName = supplierName || supplier.supplierName;
    supplier.productName = productName || supplier.productName;
    supplier.quantity = quantity !== undefined ? quantity : supplier.quantity;
    supplier.price = price || supplier.price;
    supplier.date = date || supplier.date;
    
    await supplier.save({ transaction: t });
    await t.commit();

    res.status(200).json({ success: true, message: 'Supplier updated', data: supplier });
  } catch (error) {
    await t.rollback();
    console.error('Error updating supplier:', error);
    res.status(500).json({ success: false, message: 'Server error updating supplier' });
  }
};

// Delete a supplier (and optionally revert inventory)
const deleteSupplier = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const supplier = await Supplier.findOne({ where: { id, userId }, transaction: t });
    if (!supplier) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Revert stock
    const product = await Product.findOne({ where: { productName: supplier.productName, userId }, transaction: t });
    if (product) {
      const stock = await Stock.findOne({ where: { productId: product.id, userId }, transaction: t });
      if (stock) {
        stock.quantity -= supplier.quantity;
        // prevent negative stock just in case it was sold
        if (stock.quantity < 0) stock.quantity = 0; 
        await stock.save({ transaction: t });
      }
    }

    await supplier.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({ success: true, message: 'Supplier deleted and stock reverted' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, message: 'Server error deleting supplier' });
  }
};

module.exports = {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
};
