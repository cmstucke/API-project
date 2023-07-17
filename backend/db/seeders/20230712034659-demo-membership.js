'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Membership } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Membership.bulkCreate([
      {
        userId: 2,
        groupId: 1,
        status: 'co-host'
      },
      {
        userId: 3,
        groupId: 1,
        status: 'member'
      },
      {
        userId: 4,
        groupId: 1,
        status: 'member'
      },
      {
        userId: 5,
        groupId: 1,
        status: 'pending'
      },
      {
        userId: 6,
        groupId: 1,
        status: 'pending'
      },
      {
        userId: 1,
        groupId: 2,
        status: 'co-host'
      },
      {
        userId: 3,
        groupId: 2,
        status: 'member'
      },
      {
        userId: 4,
        groupId: 2,
        status: 'member'
      },
      {
        userId: 5,
        groupId: 2,
        status: 'pending'
      },
      {
        userId: 6,
        groupId: 2,
        status: 'pending'
      },
      {
        userId: 1,
        groupId: 1,
        status: 'host'
      },
      {
        userId: 2,
        groupId: 2,
        status: 'host'
      },
      {
        userId: 3,
        groupId: 3,
        status: 'host'
      },
      {
        userId: 4,
        groupId: 4,
        status: 'host'
      },
      {
        userId: 5,
        groupId: 5,
        status: 'host'
      }
    ], { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
    }, {});
  }
};
