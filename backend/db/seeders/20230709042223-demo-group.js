'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Group } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Group.bulkCreate([
      {
        organizerId: 1,
        name: 'Group One',
        about: 'This is the first group seed record.',
        type: 'In person',
        private: false,
        city: 'Cincinnati',
        state: 'OH'
      },
      {
        organizerId: 2,
        name: 'Group Two',
        about: 'This is the second group seed record.',
        type: 'Online',
        private: true,
        city: 'Brooklyn',
        state: 'NY'
      },
      {
        organizerId: 3,
        name: 'Group Three',
        about: 'This is the third group seed record.',
        type: 'Online',
        private: false,
        city: 'Dayton',
        state: 'OH'
      },
      {
        organizerId: 4,
        name: 'Group Four',
        about: 'This is the fourth group seed record.',
        type: 'In person',
        private: false,
        city: 'Chicago',
        state: 'IL'
      },
      {
        organizerId: 5,
        name: 'Group Five',
        about: 'This is the fifth group seed record.',
        type: 'In person',
        private: false,
        city: 'Cincinnati',
        state: 'IL'
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Group One', 'Group Two', 'Group Three', 'Group Four', 'Group Five'] }
    }, {});
  }
};
