'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('sales', 'sale_allocation'),
      queryInterface.removeColumn('sales', 'swap_ratio'),
      queryInterface.removeColumn('sales', 'hard_cap'),
      queryInterface.removeColumn('sales', 'soft_cap'),
    ]).then(res => Promise.all([
      queryInterface.addColumn('sales', 'sale_allocation', { type: Sequelize.STRING }),
      queryInterface.addColumn('sales', 'swap_ratio', { type: Sequelize.STRING }),
      queryInterface.addColumn('sales', 'hard_cap', { type: Sequelize.STRING }),
      queryInterface.addColumn('sales', 'soft_cap', { type: Sequelize.STRING }),
    ]))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
