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
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo_user@email.com',
        username: 'Demo User',
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
      },
      {
        firstName: 'Firstsix',
        lastName: 'Lastsix',
        email: 'flastsix@email.com',
        username: 'user_six',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Firstseven',
        lastName: 'Lastseven',
        email: 'flastseven@email.com',
        username: 'user_seven',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Firsteight',
        lastName: 'Lasteight',
        email: 'flasteight@email.com',
        username: 'user_eight',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Firstnine',
        lastName: 'Lastnine',
        email: 'flastnine@email.com',
        username: 'user_nine',
        hashedPassword: bcrypt.hashSync('password')
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: {
        [Op.in]: [
          'user_one',
          'user_two',
          'user_three',
          'user_four',
          'user_five',
          'user_six',
          'user_seven',
          'user_eight',
          'user_nine',
        ]
      }
    }, {});
  }
};
