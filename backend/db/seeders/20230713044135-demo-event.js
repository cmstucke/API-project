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
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        type: 'In person',
        capacity: 50,
        price: 25,
        startDate: "2023-07-07T12:30:00.815Z",
        endDate: "2023-07-07T14:30:00.815Z"
      },
      {
        venueId: 4,
        groupId: 1,
        name: 'Event Four',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'In person',
        capacity: 50,
        price: 25,
        startDate: "2023-09-07T14:30:00.815Z",
        endDate: "2023-09-07T16:30:00.815Z"
      },
      {
        venueId: null,
        groupId: 1,
        name: 'Event Three',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'Online',
        capacity: 50,
        price: 25,
        startDate: "2023-08-11T14:30:00.815Z",
        endDate: "2023-08-13T14:30:00.815Z"
      },
      {
        venueId: null,
        groupId: 1,
        name: 'Event Five',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'Online',
        capacity: 50,
        price: 25,
        startDate: "2023-10-11T14:30:00.815Z",
        endDate: "2023-10-13T14:30:00.815Z"
      },
      {
        venueId: 2,
        groupId: 1,
        name: 'Event Two',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        type: 'In person',
        capacity: 50,
        price: 25,
        startDate: "2023-07-11T12:30:00.815Z",
        endDate: "2023-07-13T14:30:00.815Z"
      }
    ], { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Events';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Event One', 'Event Two', 'Event Three', 'Event Four', 'Event Five'] }
    }, {});
  }
};
