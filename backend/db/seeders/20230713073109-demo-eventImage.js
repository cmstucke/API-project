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
        url: 'https://www.meetup.com/blog/wp-content/uploads/2021/05/priscilla-du-preez-GobsYxc_H_0-unsplash-945x630.jpg',
        preview: true,
      },
      {
        eventId: 2,
        url: 'event-img-02.jpg',
        preview: true,
      },
      {
        eventId: 3,
        url: 'event-img-03.jpg',
        preview: true,
      },
      {
        eventId: 4,
        url: 'event-img-04.jpg',
        preview: true,
      },
      {
        eventId: 5,
        url: 'event-img-05.jpg',
        preview: true,
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
