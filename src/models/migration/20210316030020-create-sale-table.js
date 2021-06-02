'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('sales', {
      sale_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      project_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'projects',
          key: 'project_id'
        }
      },
      wallet_token_balance: {
        type: Sequelize.STRING
      },
      sale_allocation: {
        type: Sequelize.INTEGER
      },
      swap_ratio: {
        type: Sequelize.INTEGER
      },
      hard_cap: {
        type: Sequelize.INTEGER
      },
      soft_cap: {
        type: Sequelize.INTEGER
      },
      max_allocation_wallet_limit: {
        type: Sequelize.BOOLEAN
      },
      max_allocation_wallet: {
        type: Sequelize.STRING
      },
      min_allocation_wallet_limit: {
        type: Sequelize.BOOLEAN
      },
      min_allocation_wallet: {
        type: Sequelize.STRING
      },
      access_type: {
        type: Sequelize.STRING
      },
      sale_start_time: {
        type: Sequelize.DATE
      },
      sale_end_time: {
        type: Sequelize.DATE
      },
      listing_rate: {
        type: Sequelize.STRING
      },
      initial_liquidity_per: {
        type: Sequelize.INTEGER
      },
      listing_time: {
        type: Sequelize.DATE
      },
      lock_liquidity: {
        type: Sequelize.STRING
      },
      est_funding: {
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
    return queryInterface.dropTable('sales');
  }
};
