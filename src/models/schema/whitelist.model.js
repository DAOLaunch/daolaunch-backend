let Whitelist;
const s = (builder, Sequelize) => {
  Whitelist = builder.define('white_list', {
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
    timestamps: false
  });

  Whitelist.associate = (models) => {

  };
  return Whitelist;
};

export { Whitelist, s };
