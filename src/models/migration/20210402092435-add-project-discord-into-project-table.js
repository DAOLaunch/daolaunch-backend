'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('projects', 'project_discord', {
      type: Sequelize.STRING,
      after: 'project_medium',
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('projects', 'project_discord');
  }
};
