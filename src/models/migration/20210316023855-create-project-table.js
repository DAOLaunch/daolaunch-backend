'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('projects', {
      project_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      project_logo: {
        type: Sequelize.STRING
      },
      project_name: {
        type: Sequelize.STRING
      },
      project_website: {
        type: Sequelize.STRING
      },
      project_email: {
        type: Sequelize.STRING
      },
      project_white_paper: {
        type: Sequelize.STRING
      },
      project_additional_info: {
        type: Sequelize.STRING
      },
      project_twitter: {
        type: Sequelize.STRING
      },
      project_telegram: {
        type: Sequelize.STRING
      },
      project_medium: {
        type: Sequelize.STRING
      },
      token_contract_address: {
        type: Sequelize.STRING
      },
      token_name: {
        type: Sequelize.STRING
      },
      token_symbol: {
        type: Sequelize.STRING
      },
      payment_currency: {
        type: Sequelize.STRING
      },
      list_amm: {
        type: Sequelize.STRING
      },
      currency_pair: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    }, {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('projects');
  }
};
