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
        about: 'The is the first group seed record.',
        type: 'In person',
        private: false,
        city: 'Cincinnati',
        state: 'OH'
      },
      {
        organizerId: 2,
        name: 'Group Two',
        about: 'The is the second group seed record.',
        type: 'Online',
        private: true,
        city: 'Brooklyn',
        state: 'NY'
      },
      {
        organizerId: 1,
        name: 'Group Three',
        about: 'The is the third group seed record.',
        type: 'Online',
        private: false,
        city: 'Dayton',
        state: 'OH'
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Group One', 'Group Two', 'Group Three'] }
    }, {});
  }
};