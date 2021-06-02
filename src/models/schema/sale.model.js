let Sale;
const s = (builder, Sequelize) => {
  Sale = builder.define('sale', {
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
      type: Sequelize.STRING
    },
    swap_ratio: {
      type: Sequelize.STRING
    },
    hard_cap: {
      type: Sequelize.STRING
    },
    soft_cap: {
      type: Sequelize.STRING
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
    timestamps: false
  });

  Sale.associate = (models) => {
    Sale.belongsTo(models.project, { as: 'project', foreignKey: 'project_id' });
    Sale.hasMany(models.white_list, { as: 'white_lists', foreignKey: 'sale_id' });
  };
  return Sale;
};

const ACCESS_TYPE = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}

export { Sale, s, ACCESS_TYPE };
