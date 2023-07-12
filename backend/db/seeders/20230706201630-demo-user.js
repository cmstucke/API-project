'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        firstName: 'Firstone',
        lastName: 'Lastone',
        email: 'flastone@email.com',
        username: 'user_one',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Firsttwo',
        lastName: 'Lasttwo',
        email: 'flasttwo@email.com',
        username: 'user_two',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Firstthree',
        lastName: 'Lastthree',
        email: 'flastthree@email.com',
        username: 'user_three',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Firstfour',
        lastName: 'Lastfour',
        email: 'flastfour@email.com',
        username: 'user_four',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Firstfive',
        lastName: 'Lastfive',
        email: 'flastfive@email.com',
        username: 'user_five',
        hashedPassword: bcrypt.hashSync('password')
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['user_one', 'user_two', 'user_three', 'user_four'] }
    }, {});
  }
};
