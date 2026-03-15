const { sequelize } = require('../db/db');
const User = require('./User');
const Supplier = require('./Supplier');
const Product = require('./Product');
const Stock = require('./Stock');
const Customer = require('./Customer');
const Sale = require('./Sale');
const Expense = require('./Expense');
const AiLog = require('./AiLog');
const SubscriptionPlan = require('./SubscriptionPlan');

// Define Relationships
// User has many Suppliers
User.hasMany(Supplier, { foreignKey: 'userId' });
Supplier.belongsTo(User, { foreignKey: 'userId' });

// User has many Products
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

// User has many Stocks
User.hasMany(Stock, { foreignKey: 'userId' });
Stock.belongsTo(User, { foreignKey: 'userId' });

// Product has one Stock
Product.hasOne(Stock, { foreignKey: 'productId' });
Stock.belongsTo(Product, { foreignKey: 'productId' });

// User has many Customers
User.hasMany(Customer, { foreignKey: 'userId' });
Customer.belongsTo(User, { foreignKey: 'userId' });

// User has many Sales
User.hasMany(Sale, { foreignKey: 'userId' });
Sale.belongsTo(User, { foreignKey: 'userId' });

// Customer has many Sales
Customer.hasMany(Sale, { foreignKey: 'customerId' });
Sale.belongsTo(Customer, { foreignKey: 'customerId' });

// User has many Expenses
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

// User has many AiLogs
User.hasMany(AiLog, { foreignKey: 'userId' });
AiLog.belongsTo(User, { foreignKey: 'userId' });

// SubscriptionPlan has many Users
SubscriptionPlan.hasMany(User, { foreignKey: 'subscriptionPlanId' });
User.belongsTo(SubscriptionPlan, { foreignKey: 'subscriptionPlanId' });

// Export models
module.exports = {
  sequelize,
  User,
  Supplier,
  Product,
  Stock,
  Customer,
  Sale,
  Expense,
  AiLog,
  SubscriptionPlan
};
