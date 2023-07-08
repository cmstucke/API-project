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
        firstName: 'firstNameOne',
        lastName: 'lastNameOne',
        email: 'emailOne@email.com',
        username: 'userNameOne',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'firstNameTwo',
        lastName: 'lastNameTwo',
        email: 'emailTwo@email.com',
        username: 'userNameTwo',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'firstNameThree',
        lastName: 'lastNameThree',
        email: 'emailThree@email.com',
        username: 'userNameThree',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'firstNameFour',
        lastName: 'lastNameFour',
        email: 'emailFour@email.com',
        username: 'userNameFour',
        hashedPassword: bcrypt.hashSync('password')
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo-lition'] }
    }, {});
  }
};
