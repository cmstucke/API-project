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
        status: 'pending'
      },
      {
        userId: 5,
        groupId: 1,
        status: 'pending'
      },
      {
        userId: 5,
        groupId: 4,
        status: 'pending'
      }
    ], { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
