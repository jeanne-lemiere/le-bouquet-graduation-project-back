const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Customer extends Model {};

Customer.init({
  gender: DataTypes.TEXT,
  firstname: DataTypes.TEXT,
  lastname: DataTypes.TEXT,
  email: DataTypes.TEXT,
  password: DataTypes.TEXT,
  phone_number: DataTypes.TEXT,
  street_name: DataTypes.TEXT,
  street_number: DataTypes.STRING(4),
  city: DataTypes.TEXT,
  zipcode: DataTypes.STRING(5),
}, {
  sequelize,
  tableName: "customer"
});

module.exports = Customer;