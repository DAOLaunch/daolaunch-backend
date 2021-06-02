'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('projects', 'contract_address', {
      type: Sequelize.STRING,
      after: 'currency_pair',
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('projects', 'contract_address');
  }
};
