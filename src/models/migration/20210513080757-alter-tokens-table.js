'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('tokens', 'is_listed_uniswap_eth', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }),
      queryInterface.addColumn('tokens', 'is_listed_uniswap_usdt', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('tokens', 'is_listed_uniswap_eth'),
      queryInterface.removeColumn('tokens', 'is_listed_uniswap_usdt'),
    ])
  }
};
