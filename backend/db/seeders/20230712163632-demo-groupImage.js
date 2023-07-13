'use strict';

/** @type {import('sequelize-cli').Migration} */

const { GroupImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await GroupImage.bulkCreate([
      {
        groupId: 1,
        url: 'image.url/one',
        preview: true
      },
      {
        groupId: 1,
        url: 'image.url/two',
        preview: false
      },
      {
        groupId: 2,
        url: 'image.url/three',
        preview: true
      },
      {
        groupId: 4,
        url: 'image.url/four',
        preview: false
      },
      {
        groupId: 4,
        url: 'image.url/five',
        preview: true
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};