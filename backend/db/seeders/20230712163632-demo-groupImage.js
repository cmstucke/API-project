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
        url: 'group-img-01.jpg',
        preview: true
      },
      {
        groupId: 2,
        url: 'group-img-02.jpg',
        preview: true
      },
      {
        groupId: 3,
        url: 'group-img-03.jpg',
        preview: true
      },
      {
        groupId: 4,
        url: 'group-img-04.jpg',
        preview: true
      },
      {
        groupId: 5,
        url: 'group-img-05.jpg',
        preview: true
      }
    ], { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
