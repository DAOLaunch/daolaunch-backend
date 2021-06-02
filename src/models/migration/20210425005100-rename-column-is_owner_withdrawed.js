'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('presales', 'is_owner_withdrawed', 'is_owner_withdrawn');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('presales', 'is_owner_withdrawn', 'is_owner_withdrawed');
  }
};