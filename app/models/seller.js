const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Seller extends Model {};

Seller.init({
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
  picture_url: DataTypes.TEXT,
  siret: DataTypes.TEXT,
  shop_name: DataTypes.TEXT,
  shop_presentation: DataTypes.STRING(600),

},{
  sequelize,
  tableName: "seller"
});

module.exports = Seller;