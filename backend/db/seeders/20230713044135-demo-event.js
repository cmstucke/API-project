'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Event } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Event.bulkCreate([
      {
        venueId: 1,
        groupId: 1,
        name: 'Event One',
        description: 'This is the description for the first event seed.',
        type: 'In person',
        capacity: 50,
        price: 25,
        startDate: "2023-07-11T14:30:00.815Z",
        endDate: "2023-07-13T14:30:00.815Z"
      },
      {
        venueId: 2,
        groupId: 1,
        name: 'Event Two',
        description: 'This is the description for the second event seed.',
        type: 'In person',
        capacity: 50,
        price: 25,
        startDate: "2023-07-11T14:30:00.815Z",
        endDate: "2023-07-13T14:30:00.815Z"
      },
      {
        venueId: null,
        groupId: 1,
        name: 'Event Three',
        description: 'This is the description for the third event seed.',
        type: 'Online',
        capacity: 50,
        price: 25,
        startDate: "2023-07-11T14:30:00.815Z",
        endDate: "2023-07-13T14:30:00.815Z"
      },
      {
        venueId: 4,
        groupId: 2,
        name: 'Event Four',
        description: 'This is the description for the fourth event seed.',
        type: 'In person',
        capacity: 50,
        price: 25,
        startDate: "2023-07-11T14:30:00.815Z",
        endDate: "2023-07-13T14:30:00.815Z"
      },
      {
        venueId: null,
        groupId: 4,
        name: 'Event Five',
        description: 'This is the description for the fifth event seed.',
        type: 'Online',
        capacity: 50,
        price: 25,
        startDate: "2023-07-11T14:30:00.815Z",
        endDate: "2023-07-13T14:30:00.815Z"
      },
    ], { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Events';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Event One'] }
    }, {});
  }
};
