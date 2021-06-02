'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('orders', {
      order_id: {
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
      wallet_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'wallets',
          key: 'wallet_id'
        }
      },
      order_status: {
        type: Sequelize.STRING
      },
      order_time: {
        type: Sequelize.STRING
      },
      amount_paid: {
        type: Sequelize.STRING
      },
      currency_paid: {
        type: Sequelize.STRING
      },
      swapped_amount: {
        type: Sequelize.STRING
      },
      payment_currency: {
        type: Sequelize.STRING
      },
      swapped_transaction: {
        type: Sequelize.STRING
      },
      sale_result: {
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
    return queryInterface.dropTable('orders');
  }
};
