'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('presales', 'is_success', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'price'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('presales', 'is_success');
  }
};
