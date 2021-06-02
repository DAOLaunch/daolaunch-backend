'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('presales', 'price', {
      type: Sequelize.STRING,
      after: 'is_owner_withdrawed',
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('presales', 'price');
  }
};
