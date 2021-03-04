const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Order extends Model {};

Order.init({
  reference: DataTypes.TEXT,
  total_amount: DataTypes.TEXT,
  status: DataTypes.TEXT,
}, {
  sequelize,
  tableName: "order"
});

module.exports = Order;