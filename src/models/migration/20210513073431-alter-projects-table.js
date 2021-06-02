'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('projects', 'project_website', {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn('projects', 'project_twitter', {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn('projects', 'project_telegram', {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn('projects', 'project_medium', {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn('projects', 'project_discord', {
        type: Sequelize.TEXT,
      }),
      queryInterface.changeColumn('projects', 'project_white_paper', {
        type: Sequelize.TEXT,
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {

  }
};
