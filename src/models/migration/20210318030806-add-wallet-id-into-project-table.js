'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('projects', 'wallet_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'wallets',
        key: 'wallet_id'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('projects', 'wallet_id');
  }
};
