'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('tokens', 'token_transaction_status', {
      type: Sequelize.STRING,
    }).then(res => {
      return queryInterface.addColumn('tokens', 'token_transaction_hash', {
        type: Sequelize.STRING,
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('tokens', 'token_transaction_hash').then(res => {
      return queryInterface.remove('tokens', 'token_transaction_status')
    })
  }
};
