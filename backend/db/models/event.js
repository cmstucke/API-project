'use strict';
const { Model, Validator } = require('sequelize');

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
      Event.hasMany(models.Attendance, { foreignKey: 'eventId' });
      Event.hasMany(models.EventImage, { foreignKey: 'eventId' });
    }
  }
  Event.init({
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.ENUM,
      values: ['In person', 'Online']
    },
    capacity: {
      type: DataTypes.INTEGER
    },
    price: DataTypes.DECIMAL,
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    endDate: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
