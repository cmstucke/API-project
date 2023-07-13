'use strict';

/** @type {import('sequelize-cli').Migration} */

const { EventImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await EventImage.bulkCreate([
      {
        eventId: 1,
        url: 'image.url/one',
        preview: false,
      },
      {
        eventId: 1,
        url: 'image.url/two',
        preview: true,
      },
      {
        eventId: 1,
        url: 'image.url/three',
        preview: false,
      },
      {
        eventId: 4,
        url: 'image.url/four',
        preview: true,
      },
      {
        eventId: 4,
        url: 'image.url/five',
        preview: false,
      }
    ], { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
