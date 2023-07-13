'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(models.Venue, { foreignKey: 'venueId' });
      Event.belongsTo(models.Group, { foreignKey: 'groupId' });
    }
  }
  Event.init({
    venueId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM,
      values: ['In person', 'Online']
    },
    capacity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
