'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('projects', 'token_decimal', {
      type: Sequelize.INTEGER,
      after: 'token_symbol',
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('projects', 'token_decimal');
  }
};
