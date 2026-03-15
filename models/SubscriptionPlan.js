const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  features: {
    // Will store a JSON string or comma-separated list of features
    type: DataTypes.TEXT,
    allowNull: true,
  },
  billingCycle: {
    type: DataTypes.ENUM('MONTHLY', 'YEARLY', 'LIFETIME'),
    defaultValue: 'MONTHLY',
  },
}, {
  timestamps: true,
});

module.exports = SubscriptionPlan;
