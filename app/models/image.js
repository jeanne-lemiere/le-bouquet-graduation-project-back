const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');

class Image extends Model {};

Image.init({
  url: DataTypes.STRING,
}, {
  sequelize,
  tableName: "image"
});

module.exports = Image;