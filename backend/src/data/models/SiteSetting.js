import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class SiteSetting extends Model {}

SiteSetting.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'SiteSetting',
  tableName: 'SiteSettings',
});

export default SiteSetting;
