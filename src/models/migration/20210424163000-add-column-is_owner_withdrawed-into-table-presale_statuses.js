'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('presales', 'is_owner_withdrawed', {
      type: Sequelize.BOOLEAN,
      after: 'is_whitelist_only',
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('presales', 'is_owner_withdrawed');
  }
};