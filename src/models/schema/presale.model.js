let Presale;
const s = (builder, Sequelize) => {
  Presale = builder.define('presale', {
    presale_id: {
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
    total_tokens_sold: {
      type: Sequelize.STRING,
    },
    total_base_collected: {
      type: Sequelize.STRING,
    },
    number_buyers: {
      type: Sequelize.STRING
    },
    is_added_liquidity: {
      type: Sequelize.BOOLEAN,
    },
    is_force_failed: {
      type: Sequelize.BOOLEAN,
    },
    is_transferred_fee: {
      type: Sequelize.BOOLEAN,
    },
    is_list_on_uniswap: {
      type: Sequelize.BOOLEAN,
    },
    total_base_withdrawn: {
      type: Sequelize.STRING,
    },
    total_tokens_withdrawn: {
      type: Sequelize.STRING,
    },
    is_whitelist_only: {
      type: Sequelize.BOOLEAN,
    },
    is_owner_withdrawn: {
      type: Sequelize.BOOLEAN,
    },
    price: {
      type: Sequelize.STRING,
    },
    is_success: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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

  Presale.associate = (models) => {

  };
  return Presale;
};

export { Presale, s };
