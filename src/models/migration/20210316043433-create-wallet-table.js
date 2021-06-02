'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('wallets', {
      wallet_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      wallet_address: {
        type: Sequelize.STRING
      },
      wallet_type: {
        type: Sequelize.STRING
      },
      nick_name: {
        type: Sequelize.STRING
      },
      eth_balance: {
        type: Sequelize.STRING
      },
      usdt_balance: {
        type: Sequelize.STRING
      },
      bnb_balance: {
        type: Sequelize.STRING
      },
      busd_balance: {
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
    return queryInterface.dropTable('wallets');
  }
};
