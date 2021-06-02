'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('tokens', 'uniswap_list', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      }),
      queryInterface.removeColumn('tokens', 'is_listed_uniswap_eth'),
      queryInterface.removeColumn('tokens', 'is_listed_uniswap_usdt'),
    ])
  },

  down: (queryInterface, Sequelize) => {

  }
};
