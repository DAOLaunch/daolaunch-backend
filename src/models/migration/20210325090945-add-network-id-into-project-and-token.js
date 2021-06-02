'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('projects', 'network_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'networks',
        key: 'network_id'
      },
      after: 'wallet_id',
    }).then(res => queryInterface.addColumn('tokens', 'network_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'networks',
        key: 'network_id'
      },
      after: 'wallet_id',
    }))
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('projects', 'network_id'),
      queryInterface.removeColumn('tokens', 'network_id'),
    ])
  }
};
