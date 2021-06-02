'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('projects', 'is_list_on_uniswap', {
      type: Sequelize.BOOLEAN,
    }).then(res => {
      return queryInterface.addColumn('projects', 'is_transfer_daolaunch_fee', {
        type: Sequelize.BOOLEAN,
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('projects', 'is_list_on_uniswap').then(res => {
      return queryInterface.remove('projects', 'is_transfer_daolaunch_fee')
    })
  }
};