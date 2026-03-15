const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const AiLog = sequelize.define('AiLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  featureType: {
    type: DataTypes.ENUM('INSIGHTS', 'EMAIL', 'POST', 'INVOICE'),
    allowNull: false,
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = AiLog;
