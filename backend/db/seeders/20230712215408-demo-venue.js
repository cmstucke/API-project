'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Venue } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Venue.bulkCreate([
      {
        groupId: 1,
        address: '101 firstGroupAddress',
        city: 'Cincinnati',
        state: 'OH',
        lat: 101.01,
        lng: 101.01
      },
      {
        groupId: 1,
        address: '102 firstGroupAddress',
        city: 'Westchester',
        state: 'OH',
        lat: 101.02,
        lng: 101.02
      },
      {
        groupId: 1,
        address: '103 firstGroupAddress',
        city: 'Newport',
        state: 'KY',
        lat: 101.03,
        lng: 101.03
      },
      {
        groupId: 2,
        address: '201 secondGroupAddress',
        city: 'Chicago',
        state: 'IL',
        lat: 102.01,
        lng: 102.01
      },
      {
        groupId: 3,
        address: '301 thirdGroupAddress',
        city: 'Brooklyn',
        state: 'NY',
        lat: 103.01,
        lng: 103.01
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Venues';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      address: {
        [Op.in]: [
          '101 firstGroupAddress',
          '102 firstGroupAddress',
          '103 firstGroupAddress'
        ]
      }
    }, {});
  }
};
