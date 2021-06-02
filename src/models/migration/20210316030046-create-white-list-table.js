'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('white_lists', {
      white_list_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sale_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sales',
          key: 'sale_id'
        }
      },
      white_list_time: {
        type: Sequelize.STRING
      },
      whitelist_wallet_address: {
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
    return queryInterface.dropTable('white_lists');
  }
};
